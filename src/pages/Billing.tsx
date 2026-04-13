import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Search, Plus, Trash2, Eye, Download, FileText, CreditCard, Banknote,
    ArrowRight, CheckCircle, X, Percent, DollarSign, User, ClipboardList,
    ChevronDown, Package, Mail, AlertCircle, Loader2, Receipt
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { patientsAPI, notificationsAPI } from '../services/api';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { PageHeader } from '../components/molecules/PageHeader';

// Patients will be loaded from API

const MOCK_TREATMENTS = {
    1: [
        { id: 't1', name: 'Limpieza Dental Profunda', date: '2026-02-01', price: 120.00 },
        { id: 't2', name: 'Resina pieza #18', date: '2026-01-20', price: 85.00 },
        { id: 't3', name: 'Blanqueamiento LED', date: '2026-01-15', price: 350.00 },
        { id: 't4', name: 'Radiografía Panorámica', date: '2025-12-28', price: 45.00 },
    ],
    2: [
        { id: 't5', name: 'Ortodoncia - Control Mensual', date: '2026-02-05', price: 60.00 },
        { id: 't6', name: 'Brackets Metálicos (Colocación)', date: '2025-11-10', price: 1200.00 },
    ],
    3: [
        { id: 't7', name: 'Extracción pieza #28', date: '2026-01-30', price: 150.00 },
        { id: 't8', name: 'Consulta General', date: '2025-12-20', price: 40.00 },
    ],
};

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Efectivo', icon: Banknote },
    { id: 'transfer', label: 'Transferencia', icon: ArrowRight },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
];

let invoiceCounter = 1001;

// ── Main Component ────────────────────────────────────────────────────
const Billing = () => {
    // State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [taxRate, setTaxRate] = useState(15); // IVA %
    const [globalDiscount, setGlobalDiscount] = useState(0); // in $
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentStatus, setPaymentStatus] = useState('Pagado'); // 'Pagado' or 'Debiendo'
    const [showTreatments, setShowTreatments] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [savedInvoices, setSavedInvoices] = useState([]);

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

    // Derived values
    const subtotal = useMemo(() => invoiceItems.reduce((s, i) => s + (i.price * i.qty), 0), [invoiceItems]);
    const taxAmount = useMemo(() => (subtotal - globalDiscount) * (taxRate / 100), [subtotal, taxRate, globalDiscount]);
    const total = useMemo(() => subtotal - globalDiscount + taxAmount, [subtotal, globalDiscount, taxAmount]);

    // Patient search filter (from API data)
    const filteredPatients = apiPatients.filter(p =>
        `${p.firstName} ${p.lastName} ${p.docId}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    // Available treatments for the selected patient
    const availableTreatments = selectedPatient ? (MOCK_TREATMENTS[selectedPatient.id] || []) : [];

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

    const toast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // ── PDF Generation ──────────────────────────────────────────────
    // ── PDF Generation is externalized to pdfGenerator.js ────────────

    const [sendingNotification, setSendingNotification] = useState(false);

    const handleFinalize = async () => {
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
            subtotal, taxAmount, globalDiscount, taxRate, total, paymentMethod,
            date: new Date().toISOString(),
            status: paymentStatus
        };
        setSavedInvoices([inv, ...savedInvoices]);
        generateInvoicePDF(inv);
        toast('PDF generado y descargado exitosamente.');

        // Update patient debt on the backend if "Debiendo"
        try {
            const newDebt = paymentStatus === 'Debiendo' ? (selectedPatient.debt || 0) + total : (selectedPatient.debt || 0);

            if (paymentStatus === 'Debiendo') {
                await patientsAPI.update(selectedPatient.id, { debt: newDebt });
            }

            // Send email notification if patient has email and debt > 0
            if (selectedPatient.email && newDebt > 0) {
                setSendingNotification(true);
                try {
                    await notificationsAPI.send({
                        patient_id: selectedPatient.id,
                        recipient_email: selectedPatient.email,
                        notification_type: 'EMAIL',
                        subject: `AN-SAR – Factura pendiente de pago`,
                        message_content: `Estimado/a ${selectedPatient.firstName} ${selectedPatient.lastName},\n\nLe informamos que se ha generado una factura por $${total.toFixed(2)}.\nSu saldo pendiente actual es: $${newDebt.toFixed(2)}.\n\nPor favor, acérquese a la clínica para realizar su pago.\n\nAtentamente,\nClínica AN-SAR`,
                    });
                    toast('Factura guardada y notificación enviada al paciente.');
                } catch (notifErr) {
                    console.error('Error sending notification:', notifErr);
                    toast('Factura guardada. No se pudo enviar la notificación.');
                } finally {
                    setSendingNotification(false);
                }
            } else {
                toast('Factura guardada y deuda actualizada.');
            }

            // Refresh patients to update local debt values
            fetchPatients();
        } catch (err) {
            console.error('Error updating patient debt:', err);
            toast('Factura generada, pero no se pudo actualizar la deuda.');
        }

        setShowPreview(false);
        setInvoiceItems([]);
        setSelectedPatient(null);
        setGlobalDiscount(0);
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                        <h2 className="text-base md:text-lg font-serif font-bold text-gray-800 mb-4">Seleccionar Paciente</h2>
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

                    {/* Patient Debt Info */}
                    {selectedPatient && (
                        <div className={`rounded-2xl shadow-sm border p-4 flex flex-col sm:flex-row items-center gap-4 ${selectedPatient.debt > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className={`p-3 rounded-xl shrink-0 ${selectedPatient.debt > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                                    <DollarSign size={20} className={selectedPatient.debt > 0 ? 'text-red-500' : 'text-green-500'} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">
                                        Deuda actual: <span className={selectedPatient.debt > 0 ? 'text-red-600' : 'text-green-600'}>
                                            ${selectedPatient.debt.toFixed(2)}
                                        </span>
                                    </p>
                                    <p className="text-[10px] md:text-xs text-gray-500">
                                        {selectedPatient.email
                                            ? <>Notificación a <span className="font-medium underline decoration-primary/30">{selectedPatient.email}</span></>
                                            : <span className="text-amber-600 font-semibold">⚠ Sin email registrado</span>
                                        }
                                    </p>
                                </div>
                            </div>
                            {selectedPatient.debt > 0 && (
                                <AlertCircle size={18} className="text-red-400 hidden sm:block ml-auto" />
                            )}
                        </div>
                    )}

                    {selectedPatient && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 overflow-hidden">
                            <button
                                onClick={() => setShowTreatments(!showTreatments)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h2 className="text-base md:text-lg font-serif font-bold text-gray-800">Historia Clínica (Tratamientos)</h2>
                                <ChevronDown className={`text-gray-400 transform transition-transform ${showTreatments ? 'rotate-180' : ''}`} size={20} />
                            </button>
                            {showTreatments && (
                                <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    {availableTreatments.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-4">No hay tratamientos registrados.</p>
                                    ) : availableTreatments.map(t => {
                                        const alreadyAdded = invoiceItems.some(i => i.treatmentId === t.id);
                                        return (
                                            <div
                                                key={t.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${alreadyAdded ? 'bg-green-50/50 border-green-200' : 'border-gray-100 hover:border-primary/30 hover:bg-primary/5'}`}
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{t.name}</p>
                                                    <p className="text-[10px] text-gray-400">{t.date} · ${t.price.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => addTreatmentToInvoice(t)}
                                                    disabled={alreadyAdded}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${alreadyAdded
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                                >
                                                    {alreadyAdded ? 'Añadido' : '+ Agregar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invoice Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-base md:text-lg font-serif font-bold text-gray-800">Detalle de Factura</h2>
                            <button
                                onClick={addCustomItem}
                                className="w-full sm:w-auto bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Ítem Manual
                            </button>
                        </div>

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

                {/* ─── RIGHT COLUMN: Summary & Actions ────────────── */}
                <div className="space-y-6">

                    {/* Financial Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky lg:top-20 transition-all hover:shadow-md">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-5">Resumen de Cuenta</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Tax Rate */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">IVA (%)</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                    <Percent size={14} className="text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(Number(e.target.value))}
                                        className="w-full bg-transparent text-sm font-bold outline-none text-gray-700"
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
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">IVA ({taxRate}%)</span>
                                <span className="font-serif font-bold text-gray-700">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-4 mt-2">
                                <span className="text-base font-bold text-gray-800">TOTAL</span>
                                <span className="text-3xl font-serif font-bold text-primary animate-in zoom-in-50 duration-300">
                                    ${total.toFixed(2)}
                                </span>
                            </div>
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

                        {/* Payment Status (Pagado / Debiendo) */}
                        <div className="mt-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Estado de la Factura</label>
                            <div className="flex gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setPaymentStatus('Pagado')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentStatus === 'Pagado'
                                        ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Cancelado (Pago)
                                </button>
                                <button
                                    onClick={() => setPaymentStatus('Debiendo')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentStatus === 'Debiendo'
                                        ? 'bg-white text-red-500 shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Deuda (Por cobrar)
                                </button>
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
                                onClick={handleFinalize}
                                disabled={!selectedPatient || invoiceItems.length === 0}
                                className="w-full bg-primary hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed"
                            >
                                {sendingNotification ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                <span>{sendingNotification ? 'Notificando...' : 'Generar Factura'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    {savedInvoices.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-serif font-bold text-gray-800 mb-3">Facturas Recientes</h3>
                            <div className="space-y-2">
                                {savedInvoices.slice(0, 5).map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">{inv.patient.firstName} {inv.patient.lastName}</p>
                                            <p className="text-xs text-gray-400">{new Date(inv.date).toLocaleDateString('es-ES')}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {inv.status?.toUpperCase() || 'PAGADO'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-serif font-bold text-primary text-sm">${inv.total.toFixed(2)}</span>
                                            <button
                                                onClick={() => generateInvoicePDF(inv)}
                                                className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                                                title="Descargar PDF"
                                            >
                                                <Download size={14} /> Descargar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                <div className="flex justify-between text-sm text-gray-500"><span>IVA ({taxRate}%)</span><span>${taxAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                                    <span className="text-lg font-bold text-gray-800">TOTAL</span>
                                    <span className="text-2xl font-serif font-bold text-primary">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment badge */}
                            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <CreditCard size={14} />
                                    Método de pago: <span className="font-bold text-gray-600">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <AlertCircle size={14} />
                                    Estado: <span className={`font-bold ${paymentStatus === 'Pagado' ? 'text-green-600' : 'text-red-500'}`}>{paymentStatus.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleFinalize} className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all">
                                <Download size={16} /> Finalizar & Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Toast ──────────────────────────────────────────────── */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <CheckCircle className="text-primary" size={20} />
                    <span>{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default Billing;
