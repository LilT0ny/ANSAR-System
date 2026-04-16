import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Search, Plus, Trash2, Eye, Download, FileText, CreditCard, Banknote,
    ArrowRight, CheckCircle, X, Percent, DollarSign, User, ClipboardList,
    ChevronDown, Package, Mail, AlertCircle, Loader2, Receipt
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { patientsAPI, notificationsAPI, serviceHistoryAPI } from '../services/api';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { PageHeader, SectionHeader } from '../components/molecules';
import { useToast } from '../components/atoms';

/** Métodos de pago disponibles */
const PAYMENT_METHODS = [
    { id: 'cash', label: 'Efectivo', icon: Banknote },
    { id: 'transfer', label: 'Transferencia', icon: ArrowRight },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
];

let invoiceCounter = 1001;
const Billing = () => {
    const { showToast: toast } = useToast();
    // State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showTreatments, setShowTreatments] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [pendingInvoice, setPendingInvoice] = useState(null);
    const [sendingNotification, setSendingNotification] = useState(false);

    // ── Load patients from API ─────────────────────────────────
    const [apiPatients, setApiPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    const fetchPatients = useCallback(async () => {
        setLoadingPatients(true);
        try {
            const data = await patientsAPI.list();
            setApiPatients(data.map(p => ({
                id: p.id,
                firstName: p.first_name || '',
                lastName: p.last_name || '',
                docId: p.document_id || '',
                email: p.email || '',
                phone: p.phone || '',
                debt: Number(p.debt || 0),
            })));
        } catch (err) {
            console.error('Error loading patients:', err);
        } finally {
            setLoadingPatients(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Derived values (sin IVA)
    const subtotal = useMemo(() => invoiceItems.reduce((s, i) => s + (i.price * i.qty), 0), [invoiceItems]);
    const total = useMemo(() => subtotal - globalDiscount, [subtotal, globalDiscount]);
    const balance = useMemo(() => total - paymentAmount, [total, paymentAmount]);
    const debt = useMemo(() => Math.max(0, balance), [balance]);
    const credit = useMemo(() => Math.max(0, -balance), [balance]);

    // Patient search filter (from API data)
    const filteredPatients = apiPatients.filter(p =>
        `${p.firstName} ${p.lastName} ${p.docId}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    // Available treatments for the selected patient
    // Note: Treatments are now added manually via "Ítem Manual" or from selected services
    const availableTreatments = [];

    // ── Handlers ────────────────────────────────────────────────────
    const selectPatient = (p) => {
        setSelectedPatient(p);
        setPatientSearch('');
        setShowPatientDropdown(false);
        setInvoiceItems([]);
    };

    const addTreatmentToInvoice = (t) => {
        if (invoiceItems.find(i => i.treatmentId === t.id)) return;
        setInvoiceItems([...invoiceItems, {
            id: Date.now(),
            treatmentId: t.id,
            description: t.name,
            price: t.price,
            qty: 1,
        }]);
    };

    const addCustomItem = () => {
        setInvoiceItems([...invoiceItems, {
            id: Date.now(),
            treatmentId: null,
            description: '',
            price: 0,
            qty: 1,
        }]);
    };

    const updateItem = (id, field, value) => {
        setInvoiceItems(invoiceItems.map(i =>
            i.id === id ? { ...i, [field]: field === 'description' ? value : Number(value) } : i
        ));
    };

    const removeItem = (id) => {
        setInvoiceItems(invoiceItems.filter(i => i.id !== id));
    };



    // ── PDF Generation ──────────────────────────────────────────────
    // ── PDF Generation is externalized to pdfGenerator.js ────────────

    const handleConfirmPayment = async () => {
        if (!selectedPatient || invoiceItems.length === 0) {
            toast('Selecciona un paciente y agrega al menos un ítem.');
            return;
        }
        const invoiceNumber = `FAC-${String(invoiceCounter++).padStart(6, '0')}`;
        const inv = {
            id: Date.now(),
            invoiceNumber,
            patient: selectedPatient,
            items: [...invoiceItems],
            subtotal, globalDiscount, total, paymentAmount, debt, paymentMethod,
            date: new Date().toISOString()
        };
        setPendingInvoice(inv);

        try {
            // Calcular balance neto: positivo = deuda, negativo = crédito a favor
            const balance = total - paymentAmount;
            const newPatientDebt = (selectedPatient.debt || 0) + balance;

            // Guardar atención/servicio en historial
            await serviceHistoryAPI.create({
                patient_id: selectedPatient.id,
                invoiceNumber,
                subtotal,
                globalDiscount,
                total,
                paymentAmount,
                debt,
                paymentMethod,
                items: invoiceItems
            });

            // Actualizar deuda del paciente
            await patientsAPI.update(selectedPatient.id, { debt: newPatientDebt });

            if (selectedPatient.email && debt > 0) {
                setSendingNotification(true);
                try {
                    await notificationsAPI.send({
                        patient_id: selectedPatient.id,
                        recipient_email: selectedPatient.email,
                        notification_type: 'EMAIL',
                        subject: `AN-SAR – Factura pendiente de pago`,
                        message_content: `Estimado/a ${selectedPatient.firstName} ${selectedPatient.lastName},\n\nLe informamos que se ha generado una factura por $${total.toFixed(2)}.\nAbono realizado: $${paymentAmount.toFixed(2)}.\nSu saldo pendiente es: $${debt.toFixed(2)}.\n\nPor favor, acérquese a la clínica para completar el pago.\n\nAtentamente,\nClínica AN-SAR`,
                    });
                } catch (notifErr) {
                    console.error('Error sending notification:', notifErr);
                }
                setSendingNotification(false);
            }

            // Show download confirmation modal
            setShowDownloadModal(true);
            toast('Pago confirmado. ¿Deseas descargar la factura?');

            // Refresh patients to update local debt values
            fetchPatients();
        } catch (err) {
            console.error('Error confirming payment:', err);
            toast('Error al confirmar el pago. Por favor intenta nuevamente.');
        }
    };

    const handleDownloadInvoice = () => {
        if (pendingInvoice) {
            generateInvoicePDF(pendingInvoice);
            toast('Factura descargada exitosamente.');
        }
        resetBillingForm();
    };

    const resetBillingForm = () => {
        setShowDownloadModal(false);
        setInvoiceItems([]);
        setSelectedPatient(null);
        setGlobalDiscount(0);
        setPaymentAmount(0);
        setPendingInvoice(null);
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* Header */}
            <PageHeader 
                title="Facturación"
                subtitle="Genera facturas, aplica descuentos y descarga en PDF."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ─── LEFT COLUMN: Patient & Treatments ──────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Patient Selector */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader
                            title="Seleccionar Paciente"
                            icon={User}
                            iconColor="text-blue-600"
                            gradientFrom="from-blue-50"
                            gradientTo="to-blue-50/50"
                            className="rounded-t-2xl"
                        />
                        <div className="p-4 md:p-6">
                        <div className="relative">
                            <div className="flex items-center border border-gray-200 rounded-lg px-3 md:px-4 py-2.5 md:py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                <Search className="text-gray-400 mr-2 md:mr-3" size={18} />
                                <input
                                    type="text"
                                    placeholder="Nombre o cédula..."
                                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-sans text-sm md:text-base"
                                    value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : patientSearch}
                                    onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); setSelectedPatient(null); }}
                                    onFocus={() => setShowPatientDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                                />
                                {selectedPatient && (
                                    <button onClick={() => { setSelectedPatient(null); setInvoiceItems([]); }} className="text-gray-400 hover:text-red-500">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            {showPatientDropdown && !selectedPatient && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                    {filteredPatients.length === 0 ? (
                                        <div className="px-4 py-3 text-gray-400 text-sm">No se encontraron pacientes.</div>
                                    ) : filteredPatients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => selectPatient(p)}
                                            className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                {p.firstName[0]}{p.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{p.firstName} {p.lastName}</p>
                                                <p className="text-[10px] text-gray-400">Cédula: {p.docId}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Patient Debt Status */}
                    {selectedPatient && (
                        <div className="p-4 rounded-xl border-2 flex items-center justify-between" style={{
                            borderColor: selectedPatient.debt > 0 ? '#f97316' : '#22c55e',
                            backgroundColor: selectedPatient.debt > 0 ? '#fed7aa15' : '#dcfce715'
                        }}>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedPatient.debt > 0 ? '#9a3412' : '#166534' }}>
                                    {selectedPatient.debt > 0 ? 'Deuda Pendiente' : 'Sin Deuda'}
                                </p>
                                <p className="text-lg font-bold font-serif mt-1" style={{ color: selectedPatient.debt > 0 ? '#ea580c' : '#16a34a' }}>
                                    ${selectedPatient.debt.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}


                    {/* Invoice Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <SectionHeader
                            title="Detalle de Factura"
                            icon={ClipboardList}
                            iconColor="text-primary"
                            gradientFrom="from-primary/10"
                            gradientTo="to-primary/5"
                            action={
                                <button
                                    onClick={addCustomItem}
                                    className="w-full sm:w-auto bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Ítem Manual
                                </button>
                            }
                        />
                        <div className="p-4 md:p-6">

                        {invoiceItems.length === 0 ? (
                            <div className="text-center py-12 text-gray-300">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={32} />
                                </div>
                                <p className="font-bold text-sm">Sin ítems agregados</p>
                                <p className="text-[10px] mt-1">Busca tratamientos arriba o agrega manuales.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Large screens table */}
                                <div className="hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                                                <th className="pb-3 text-left w-1/2">Descripción</th>
                                                <th className="pb-3 text-center w-20">Cant.</th>
                                                <th className="pb-3 text-right w-28">Precio Unit.</th>
                                                <th className="pb-3 text-right w-28">Total</th>
                                                <th className="pb-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {invoiceItems.map(item => (
                                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 pr-3">
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 transition-colors text-gray-800 font-medium"
                                                            placeholder="Descripción del servicio..."
                                                        />
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty}
                                                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                                            className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg py-1.5 focus:ring-2 focus:ring-primary/30 outline-none font-bold"
                                                        />
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-gray-400 mr-1">$</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                                className="w-24 text-right bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 focus:ring-2 focus:ring-primary/30 outline-none font-bold text-primary"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right font-serif font-bold text-gray-800">
                                                        ${(item.price * item.qty).toFixed(2)}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile card-based view */}
                                <div className="md:hidden space-y-4">
                                    {invoiceItems.map(item => (
                                        <div key={item.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute top-3 right-3 text-gray-300 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Descripción</label>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                                        placeholder="Descripción..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Cantidad</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty}
                                                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-bold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Precio Unit.</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                                className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-bold text-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Subtotal</span>
                                                    <span className="text-sm font-bold text-gray-800 font-serif">${(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Summary & Actions ────────────── */}
                <div className="space-y-6">

                    {/* Financial Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky lg:top-20 transition-all hover:shadow-md">
                        <SectionHeader
                            title="Resumen de Cuenta"
                            icon={Receipt}
                            iconColor="text-purple-600"
                            gradientFrom="from-purple-50"
                            gradientTo="to-purple-50/50"
                        />
                        <div className="p-6">

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Payment/Abono */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Abono ($)</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                    <DollarSign size={14} className="text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                        className="w-full bg-transparent text-sm font-bold outline-none text-green-600"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Discount */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Desc. ($)</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                    <DollarSign size={14} className="text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={globalDiscount}
                                        onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                                        className="w-full bg-transparent text-sm font-bold outline-none text-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-3 border-t border-gray-100 pt-5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-serif font-bold text-gray-700">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Descuento</span>
                                <span className="font-serif font-bold text-red-500">-${globalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-4 mt-2">
                                <span className="text-base font-bold text-gray-800">TOTAL</span>
                                <span className="text-3xl font-serif font-bold text-primary animate-in zoom-in-50 duration-300">
                                    ${total.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                                <span className="text-gray-600 font-semibold">Abono</span>
                                <span className="font-serif font-bold text-green-600">${paymentAmount.toFixed(2)}</span>
                            </div>
                            {debt > 0 ? (
                                <div className="flex justify-between text-sm bg-orange-50 p-3 rounded-lg">
                                    <span className="text-gray-600 font-semibold">Deuda</span>
                                    <span className="font-serif font-bold text-orange-600">${debt.toFixed(2)}</span>
                                </div>
                            ) : credit > 0 ? (
                                <div className="flex justify-between text-sm bg-blue-50 p-3 rounded-lg">
                                    <span className="text-gray-600 font-semibold">Crédito a Favor</span>
                                    <span className="font-serif font-bold text-blue-600">${credit.toFixed(2)}</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                                    <span className="text-gray-600 font-semibold">Estado</span>
                                    <span className="font-serif font-bold text-green-600">Pagado Completo</span>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="mt-8">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Método de Pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-[10px] font-bold transition-all ${paymentMethod === m.id
                                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                            : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <m.icon size={18} />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (!selectedPatient || invoiceItems.length === 0) {
                                        toast('Selecciona un paciente y agrega ítems.');
                                        return;
                                    }
                                    setShowPreview(true);
                                }}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                            >
                                <Eye size={18} /> Vista Previa
                            </button>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={!selectedPatient || invoiceItems.length === 0}
                                className="w-full bg-primary hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed"
                            >
                                {sendingNotification ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                <span>{sendingNotification ? 'Procesando...' : 'Confirmar Pago'}</span>
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── PREVIEW MODAL ─────────────────────────────────────── */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-serif font-bold text-gray-800">Vista Previa de Factura</h2>
                            <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Invoice Brand */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-gray-800">AN-SAR</h3>
                                    <p className="text-xs text-gray-400">Clínica Odontológica Integral</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">FACTURA</span>
                                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString('es-ES')}</p>
                                </div>
                            </div>

                            {/* Patient */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Paciente</p>
                                <p className="font-semibold text-gray-800">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                <p className="text-xs text-gray-400">Cédula: {selectedPatient?.docId} · {selectedPatient?.email}</p>
                            </div>

                            {/* Items */}
                            <table className="w-full text-sm mb-6">
                                <thead>
                                    <tr className="text-gray-500 text-xs font-medium border-b border-gray-200">
                                        <th className="pb-2 text-left">#</th>
                                        <th className="pb-2 text-left">Descripción</th>
                                        <th className="pb-2 text-center">Cant.</th>
                                        <th className="pb-2 text-right">P. Unit.</th>
                                        <th className="pb-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoiceItems.map((item, i) => (
                                        <tr key={item.id}>
                                            <td className="py-2 text-gray-400">{i + 1}</td>
                                            <td className="py-2 text-gray-800 font-medium">{item.description || '—'}</td>
                                            <td className="py-2 text-center text-gray-600">{item.qty}</td>
                                            <td className="py-2 text-right text-gray-600">${item.price.toFixed(2)}</td>
                                            <td className="py-2 text-right font-semibold text-gray-800">${(item.price * item.qty).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>Descuento</span><span className="text-red-500">-${globalDiscount.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                                    <span className="text-lg font-bold text-gray-800">TOTAL</span>
                                    <span className="text-2xl font-serif font-bold text-primary">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm bg-green-50 p-2 rounded"><span className="text-green-700 font-semibold">Abono</span><span className="text-green-700 font-bold">${paymentAmount.toFixed(2)}</span></div>
                                {debt > 0 ? (
                                    <div className="flex justify-between text-sm bg-orange-50 p-2 rounded"><span className="text-orange-700 font-semibold">Deuda</span><span className="text-orange-700 font-bold">${debt.toFixed(2)}</span></div>
                                ) : credit > 0 ? (
                                    <div className="flex justify-between text-sm bg-blue-50 p-2 rounded"><span className="text-blue-700 font-semibold">Crédito a Favor</span><span className="text-blue-700 font-bold">${credit.toFixed(2)}</span></div>
                                ) : (
                                    <div className="flex justify-between text-sm bg-green-50 p-2 rounded"><span className="text-green-700 font-semibold">Estado</span><span className="text-green-700 font-bold">Pagado</span></div>
                                )}
                            </div>

                            {/* Payment badge */}
                            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <CreditCard size={14} />
                                    Método de pago: <span className="font-bold text-gray-600">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                                </div>
                                {debt > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                        <AlertCircle size={14} />
                                        Deuda pendiente: <span className="font-bold">${debt.toFixed(2)}</span>
                                    </div>
                                )}
                                {debt === 0 && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                        <CheckCircle size={14} />
                                        Factura pagada completamente
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DOWNLOAD CONFIRMATION MODAL ─────────────────────── */}
            {showDownloadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Pago Confirmado</h2>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            El pago ha sido registrado exitosamente. ¿Deseas descargar la factura?
                        </p>

                        {pendingInvoice && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Paciente:</span>
                                    <span className="font-semibold text-gray-800">{pendingInvoice.patient.firstName} {pendingInvoice.patient.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-semibold text-primary">${pendingInvoice.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Abono:</span>
                                    <span className="font-semibold text-green-600">${pendingInvoice.paymentAmount.toFixed(2)}</span>
                                </div>
                                {pendingInvoice.debt > 0 && (
                                    <div className="flex justify-between border-t border-gray-200 pt-2">
                                        <span className="text-gray-600">Deuda:</span>
                                        <span className="font-semibold text-orange-600">${pendingInvoice.debt.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={resetBillingForm}
                                className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Sin Descargar
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                className="flex-1 bg-primary hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                                <Download size={16} /> Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Billing;
