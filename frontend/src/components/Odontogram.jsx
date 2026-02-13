import React, { useState } from 'react';
import useOdontogramStore from '../store/useOdontogramStore';
import Tooth from './Tooth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, Activity, Trash2, MousePointer, CircleSlash,
    Save, RotateCcw, FileText, AlertCircle, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

// Tool definitions
const TOOLS = [
    { id: 'select', label: 'Seleccionar', icon: MousePointer, color: 'text-blue-500', desc: 'Haz clic para ver detalles del diente' },
    { id: 'caries', label: 'Caries', icon: Activity, color: 'text-red-500', desc: 'Marca caries en superficies individuales' },
    { id: 'treated', label: 'Tratado', icon: Check, color: 'text-green-500', desc: 'Marca superficies como tratadas' },
    { id: 'missing', label: 'Ausente', icon: CircleSlash, color: 'text-gray-600', desc: 'Marca el diente como ausente/extraído' },
    { id: 'healthy', label: 'Limpiar', icon: Trash2, color: 'text-cyan-500', desc: 'Restaura la superficie a estado sano' },
];

// Status legend
const LEGEND = [
    { label: 'Sano', color: '#FFFFFF', border: '#D1D5DB' },
    { label: 'Caries', color: '#EF4444', border: '#EF4444' },
    { label: 'Tratado', color: '#8CC63E', border: '#8CC63E' },
    { label: 'Ausente', color: '#D1D5DB', border: '#6D6E72' },
];

const Odontogram = ({ patientId, readOnly = false }) => {
    const teeth = useOdontogramStore((state) => state.teeth);
    const selectedTooth = useOdontogramStore((state) => state.selectedTooth);
    const selectTooth = useOdontogramStore((state) => state.selectTooth);
    const updateToothNotes = useOdontogramStore((state) => state.updateToothNotes);
    const updateToothStatus = useOdontogramStore((state) => state.updateToothStatus);
    const reset = useOdontogramStore((state) => state.reset);

    const [currentTool, setCurrentTool] = useState('select');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [localNotes, setLocalNotes] = useState('');

    // Standard FDI Notation
    const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
    const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
    const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

    const handleToothClick = (id) => {
        if (readOnly) return;
        selectTooth(id);
        // Load notes for the selected tooth
        const toothData = teeth[id];
        setLocalNotes(toothData?.notes || '');
    };

    const getToothState = (id) => teeth[id] || { status: 'healthy', surfaces: {}, notes: '' };

    const saveNotes = () => {
        if (selectedTooth) {
            updateToothNotes(selectedTooth, localNotes);
            toast('Notas guardadas correctamente.');
        }
    };

    const toast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('¿Estás seguro de que deseas reiniciar todo el odontograma? Se perderán todos los registros.')) {
            reset();
            toast('Odontograma reiniciado.');
        }
    };

    const handleSave = () => {
        // In a real app, this would save to the backend
        console.log('Saving odontogram data:', teeth);
        toast('Odontograma guardado exitosamente.');
    };

    // Count teeth with conditions
    const teethWithConditions = Object.entries(teeth).filter(([, data]) => data.status !== 'healthy');
    const cariesCount = Object.values(teeth).filter(t => t.status === 'caries' || Object.values(t.surfaces || {}).some(s => s === 'caries')).length;
    const treatedCount = Object.values(teeth).filter(t => t.status === 'treated' || Object.values(t.surfaces || {}).some(s => s === 'treated')).length;
    const missingCount = Object.values(teeth).filter(t => t.status === 'missing').length;

    const selectedToothState = selectedTooth ? getToothState(selectedTooth) : null;

    // Helper: surface condition labels
    const getSurfaceLabel = (surface) => {
        const labels = { vestibular: 'Vestibular (↑)', distal: 'Distal (→)', lingual: 'Lingual (↓)', mesial: 'Mesial (←)', oclusal: 'Oclusal (■)' };
        return labels[surface] || surface;
    };

    const getConditionBadge = (condition) => {
        const styles = {
            caries: 'bg-red-100 text-red-600 border-red-200',
            treated: 'bg-green-100 text-green-600 border-green-200',
            missing: 'bg-gray-100 text-gray-600 border-gray-200',
            healthy: 'bg-blue-50 text-blue-500 border-blue-200',
        };
        return styles[condition] || styles.healthy;
    };

    return (
        <div className="relative">
            {/* Main Card */}
            <div className={clsx(
                "bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all",
                readOnly && "opacity-70"
            )}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-serif font-bold text-gray-800">
                            Odontograma {readOnly ? '(Solo Lectura)' : 'Interactivo'}
                        </h2>
                        {!readOnly && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                                Edición Activa
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!readOnly && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                title="Reiniciar odontograma"
                            >
                                <RotateCcw size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                            >
                                <Save size={16} />
                                Guardar
                            </button>
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                {!readOnly && (
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            {TOOLS.map(tool => (
                                <button
                                    type="button"
                                    key={tool.id}
                                    onClick={() => setCurrentTool(tool.id)}
                                    className={clsx(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        currentTool === tool.id
                                            ? "bg-white shadow-sm ring-1 ring-gray-200 scale-105"
                                            : "hover:bg-gray-100 text-gray-500"
                                    )}
                                    title={tool.desc}
                                >
                                    <tool.icon size={16} className={currentTool === tool.id ? tool.color : 'text-gray-400'} />
                                    <span className={clsx(
                                        "hidden sm:inline",
                                        currentTool === tool.id ? 'text-gray-800' : 'text-gray-500'
                                    )}>
                                        {tool.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {/* Active tool tip */}
                        <p className="text-xs text-gray-400 mt-2 ml-1">
                            🛠️ {TOOLS.find(t => t.id === currentTool)?.desc}
                        </p>
                    </div>
                )}

                {/* Statistics mini-bar */}
                {!readOnly && (
                    <div className="flex items-center gap-4 mb-6 text-xs">
                        <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            Caries: {cariesCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            Tratados: {treatedCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                            <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                            Ausentes: {missingCount}
                        </span>
                    </div>
                )}

                {/* Dental Arches */}
                <div className="flex flex-col items-center space-y-6 overflow-x-auto pb-4">
                    {/* Upper Arch Label */}
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maxilar Superior</div>

                    {/* Upper Arch */}
                    <div className="flex gap-4 sm:gap-6">
                        <div className="flex border-b-2 border-primary/30 pb-3 gap-px">
                            {upperRight.map(num => (
                                <Tooth
                                    key={num}
                                    id={num}
                                    number={num}
                                    onSelect={handleToothClick}
                                    activeTool={currentTool}
                                    readOnly={readOnly}
                                />
                            ))}
                        </div>
                        <div className="w-px bg-gray-300 self-stretch" /> {/* Midline */}
                        <div className="flex border-b-2 border-primary/30 pb-3 gap-px">
                            {upperLeft.map(num => (
                                <Tooth
                                    key={num}
                                    id={num}
                                    number={num}
                                    onSelect={handleToothClick}
                                    activeTool={currentTool}
                                    readOnly={readOnly}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Lower Arch Label */}
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maxilar Inferior</div>

                    {/* Lower Arch */}
                    <div className="flex gap-4 sm:gap-6">
                        <div className="flex border-t-2 border-primary/30 pt-3 gap-px">
                            {lowerRight.map(num => (
                                <Tooth
                                    key={num}
                                    id={num}
                                    number={num}
                                    onSelect={handleToothClick}
                                    activeTool={currentTool}
                                    readOnly={readOnly}
                                />
                            ))}
                        </div>
                        <div className="w-px bg-gray-300 self-stretch" /> {/* Midline */}
                        <div className="flex border-t-2 border-primary/30 pt-3 gap-px">
                            {lowerLeft.map(num => (
                                <Tooth
                                    key={num}
                                    id={num}
                                    number={num}
                                    onSelect={handleToothClick}
                                    activeTool={currentTool}
                                    readOnly={readOnly}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-5 mt-6 pt-4 border-t border-gray-100">
                    {LEGEND.map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: item.color, borderColor: item.border }}
                            />
                            <span className="font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── SELECTED TOOTH DETAIL PANEL ──────────────────────── */}
            <AnimatePresence>
                {selectedTooth && !readOnly && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 bg-white p-5 rounded-2xl shadow-lg border border-gray-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="text-primary" size={18} />
                                    Diente #{selectedTooth}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Estado general: <span className={clsx(
                                        "font-bold capitalize",
                                        selectedToothState?.status === 'healthy' && 'text-blue-500',
                                        selectedToothState?.status === 'caries' && 'text-red-500',
                                        selectedToothState?.status === 'treated' && 'text-green-500',
                                        selectedToothState?.status === 'missing' && 'text-gray-500',
                                        selectedToothState?.status === 'custom' && 'text-amber-500',
                                    )}>
                                        {selectedToothState?.status === 'custom' ? 'Mixto' : selectedToothState?.status}
                                    </span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => selectTooth(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Surface Status */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Superficies</p>
                                <div className="space-y-1.5">
                                    {['vestibular', 'distal', 'lingual', 'mesial', 'oclusal'].map(surface => {
                                        const condition = selectedToothState?.surfaces?.[surface] || 'healthy';
                                        return (
                                            <div key={surface} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 font-medium">{getSurfaceLabel(surface)}</span>
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded-full text-xs font-bold border capitalize",
                                                    getConditionBadge(condition)
                                                )}>
                                                    {condition === 'healthy' ? 'Sano' : condition === 'caries' ? 'Caries' : condition === 'treated' ? 'Tratado' : condition}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Quick actions */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => { updateToothStatus(selectedTooth, 'treated'); toast('Diente marcado como tratado.'); }}
                                        className="flex-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 py-1.5 rounded-lg font-bold transition-colors border border-green-200"
                                    >
                                        ✓ Marcar Tratado
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { updateToothStatus(selectedTooth, 'healthy'); toast('Diente restaurado a sano.'); }}
                                        className="flex-1 text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 py-1.5 rounded-lg font-bold transition-colors border border-gray-200"
                                    >
                                        ↻ Limpiar Todo
                                    </button>
                                </div>
                            </div>

                            {/* Clinical Notes */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notas Clínicas</p>
                                <textarea
                                    value={localNotes}
                                    onChange={(e) => setLocalNotes(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Escribe observaciones clínicas..."
                                    rows={4}
                                />
                                <button
                                    type="button"
                                    onClick={saveNotes}
                                    className="w-full mt-2 bg-primary hover:bg-green-600 text-white text-sm py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Save size={14} />
                                    Guardar Notas
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Toast ──────────────────────────────────────────── */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 bg-gray-800 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50"
                    >
                        <CheckCircle className="text-primary" size={18} />
                        <span className="text-sm font-medium">{toastMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Odontogram;
