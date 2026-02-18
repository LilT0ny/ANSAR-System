import React, { useState, useMemo } from 'react';
import {
    Search, Plus, Trash2, Eye, Download, FileText, CreditCard, Banknote,
    ArrowRight, CheckCircle, X, Percent, DollarSign, User, ClipboardList,
    ChevronDown, Package
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ── Mock Data ─────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
    { id: 1, firstName: 'Juan', lastName: 'Pérez', docId: '12345678', email: 'juan@example.com', phone: '555-0123' },
    { id: 2, firstName: 'María', lastName: 'López', docId: '87654321', email: 'maria@example.com', phone: '555-0987' },
    { id: 3, firstName: 'Carlos', lastName: 'Ruiz', docId: '11223344', email: 'carlos@example.com', phone: '555-4433' },
];

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
    const [showTreatments, setShowTreatments] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [savedInvoices, setSavedInvoices] = useState([]);

    // Derived values
    const subtotal = useMemo(() => invoiceItems.reduce((s, i) => s + (i.price * i.qty), 0), [invoiceItems]);
    const taxAmount = useMemo(() => (subtotal - globalDiscount) * (taxRate / 100), [subtotal, taxRate, globalDiscount]);
    const total = useMemo(() => subtotal - globalDiscount + taxAmount, [subtotal, globalDiscount, taxAmount]);

    // Patient search filter
    const filteredPatients = MOCK_PATIENTS.filter(p =>
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
    const generatePDF = () => {
        const doc = new jsPDF();

        // Brand bar
        doc.setFillColor(140, 198, 62); // #8CC63E
        doc.rect(0, 0, 210, 8, 'F');

        // Logo text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(55, 55, 60);
        doc.text('AN-SAR', 20, 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(109, 110, 114);
        doc.text('Clínica Odontológica Integral', 20, 31);

        // Invoice info
        const invoiceNumber = `FAC-${String(invoiceCounter++).padStart(6, '0')}`;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(140, 198, 62);
        doc.text('FACTURA', 150, 20);
        doc.setTextColor(55, 55, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Nro: ${invoiceNumber}`, 150, 27);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 150, 33);
        doc.text(`Método: ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}`, 150, 39);

        // Divider
        doc.setDrawColor(229, 231, 235);
        doc.line(20, 43, 190, 43);

        // Patient info
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 55, 60);
        doc.text('DATOS DEL PACIENTE', 20, 52);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(109, 110, 114);
        doc.text(`Nombre: ${selectedPatient.firstName} ${selectedPatient.lastName}`, 20, 59);
        doc.text(`Cédula: ${selectedPatient.docId}`, 20, 65);
        doc.text(`Email: ${selectedPatient.email}`, 110, 59);
        doc.text(`Teléfono: ${selectedPatient.phone}`, 110, 65);

        // Items table
        const tableBody = invoiceItems.map((item, idx) => [
            idx + 1,
            item.description,
            item.qty,
            `$${item.price.toFixed(2)}`,
            `$${(item.price * item.qty).toFixed(2)}`,
        ]);

        doc.autoTable({
            startY: 75,
            head: [['#', 'Descripción', 'Cant.', 'Precio Unit.', 'Total']],
            body: tableBody,
            styles: {
                fontSize: 9,
                cellPadding: 4,
                textColor: [55, 55, 60],
                lineColor: [229, 231, 235],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [249, 250, 251],
                textColor: [55, 55, 60],
                fontStyle: 'bold',
                lineColor: [229, 231, 235],
            },
            alternateRowStyles: { fillColor: [252, 252, 253] },
            margin: { left: 20, right: 20 },
        });

        // Summary section
        const finalY = doc.lastAutoTable.finalY + 10;
        const summaryX = 130;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(109, 110, 114);
        doc.text('Subtotal:', summaryX, finalY);
        doc.text(`$${subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });

        doc.text('Descuento:', summaryX, finalY + 7);
        doc.text(`-$${globalDiscount.toFixed(2)}`, 180, finalY + 7, { align: 'right' });

        doc.text(`IVA (${taxRate}%):`, summaryX, finalY + 14);
        doc.text(`$${taxAmount.toFixed(2)}`, 180, finalY + 14, { align: 'right' });

        doc.setDrawColor(140, 198, 62);
        doc.setLineWidth(0.5);
        doc.line(summaryX, finalY + 18, 190, finalY + 18);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(55, 55, 60);
        doc.text('TOTAL:', summaryX, finalY + 26);
        doc.setTextColor(140, 198, 62);
        doc.text(`$${total.toFixed(2)}`, 180, finalY + 26, { align: 'right' });

        // Footer
        const footerY = 275;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(170, 170, 170);
        doc.text('AN-SAR Clínica Odontológica · Generado automáticamente · Este documento es un comprobante de pago.', 105, footerY, { align: 'center' });

        // Brand bar bottom
        doc.setFillColor(140, 198, 62);
        doc.rect(0, 289, 210, 8, 'F');

        doc.save(`Factura_${selectedPatient.lastName}_${invoiceNumber}.pdf`);
        toast('PDF generado y descargado exitosamente.');
    };

    const handleFinalize = () => {
        if (!selectedPatient || invoiceItems.length === 0) {
            toast('Selecciona un paciente y agrega al menos un ítem.');
            return;
        }
        const inv = {
            id: Date.now(),
            patient: selectedPatient,
            items: [...invoiceItems],
            subtotal, taxAmount, globalDiscount, total, paymentMethod,
            date: new Date().toISOString(),
        };
        setSavedInvoices([inv, ...savedInvoices]);
        generatePDF();
        setShowPreview(false);
        setInvoiceItems([]);
        setSelectedPatient(null);
        setGlobalDiscount(0);
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-serif font-bold text-gray-800">Facturación por Paciente</h1>
                <p className="text-secondary mt-1">Genera facturas detalladas, aplica descuentos, y descarga en PDF.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ─── LEFT COLUMN: Patient & Treatments ──────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Patient Selector */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">Seleccionar Paciente</h2>
                        <div className="relative">
                            <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                <Search className="text-gray-400 mr-3" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por nombre o cédula..."
                                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-sans"
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
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {p.firstName[0]}{p.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{p.firstName} {p.lastName}</p>
                                                <p className="text-xs text-gray-400">Cédula: {p.docId}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Import from Treatments */}
                    {selectedPatient && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <button
                                onClick={() => setShowTreatments(!showTreatments)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h2 className="text-lg font-serif font-bold text-gray-800">Tratamientos de Historia Clínica</h2>
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
                                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${alreadyAdded ? 'bg-green-50/50 border-green-200' : 'border-gray-100 hover:border-primary/30 hover:bg-primary/5'}`}
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                                                    <p className="text-xs text-gray-400">{t.date} · ${t.price.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => addTreatmentToInvoice(t)}
                                                    disabled={alreadyAdded}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${alreadyAdded
                                                        ? 'bg-green-100 text-green-600 cursor-default'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer'}`}
                                                >
                                                    {alreadyAdded ? '✓ Añadido' : '+ Agregar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invoice Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-serif font-bold text-gray-800">Detalle de Factura</h2>
                            <button
                                onClick={addCustomItem}
                                className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <Plus size={16} /> Ítem Manual
                            </button>
                        </div>

                        {invoiceItems.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Sin ítems agregados</p>
                                <p className="text-xs mt-1">Selecciona tratamientos o agrega ítems manualmente.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs font-medium border-b border-gray-100">
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
                                                <td className="py-3 pr-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 transition-colors text-gray-800"
                                                        placeholder="Descripción..."
                                                    />
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                                        className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg py-1 focus:ring-2 focus:ring-primary/30 outline-none"
                                                    />
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end">
                                                        <span className="text-gray-400 mr-1">$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                            className="w-24 text-right bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary/30 outline-none"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right font-semibold text-gray-800 font-serif">
                                                    ${(item.price * item.qty).toFixed(2)}
                                                </td>
                                                <td className="py-3 text-center">
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
                        )}
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Summary & Actions ────────────── */}
                <div className="space-y-6">

                    {/* Financial Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-5">Resumen</h2>

                        {/* Tax Rate */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">IVA (%)</label>
                            <div className="flex items-center gap-2">
                                <Percent size={14} className="text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                />
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Descuento ($)</label>
                            <div className="flex items-center gap-2">
                                <DollarSign size={14} className="text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    value={globalDiscount}
                                    onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                />
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-serif font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Descuento</span>
                                <span className="font-serif font-semibold text-red-500">-${globalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>IVA ({taxRate}%)</span>
                                <span className="font-serif font-semibold text-gray-700">${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                                <span className="text-base font-bold text-gray-800">TOTAL</span>
                                <span className="text-2xl font-serif font-bold text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-6">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Método de Pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${paymentMethod === m.id
                                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                            : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <m.icon size={18} />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => {
                                    if (!selectedPatient || invoiceItems.length === 0) {
                                        toast('Selecciona un paciente y agrega ítems.');
                                        return;
                                    }
                                    setShowPreview(true);
                                }}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                                <Eye size={18} /> Vista Previa
                            </button>

                            <button
                                onClick={handleFinalize}
                                disabled={!selectedPatient || invoiceItems.length === 0}
                                className="w-full bg-primary hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                <Download size={18} /> Guardar & Descargar PDF
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
                                        </div>
                                        <span className="font-serif font-bold text-primary text-sm">${inv.total.toFixed(2)}</span>
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
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <CreditCard size={14} />
                                Método de pago: <span className="font-bold text-gray-600">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
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
