import React, { useState } from 'react';
import useOdontogramStore from '../store/useOdontogramStore';
import useConfigStore from '../store/useConfigStore';
import Tooth from './Tooth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, Activity, Trash2, MousePointer,
    Save, RotateCcw, FileText, AlertCircle, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

// Tool definitions - Only RED (todo) and BLUE (done)
const TOOLS = [
    { id: 'select', label: 'Seleccionar', icon: MousePointer, color: 'text-gray-500', desc: 'Haz clic para ver detalles' },
    { id: 'todo', label: 'Por Hacer', icon: Activity, color: 'text-red-500', desc: 'Rojo: Tratamiento por realizar' },
    { id: 'done', label: 'Realizado', icon: Check, color: 'text-blue-500', desc: 'Azul: Tratamiento realizado' },
    { id: 'clean', label: 'Limpiar', icon: Trash2, color: 'text-gray-400', desc: 'Limpiar estado del diente' },
];

const Odontogram = ({ patientId, readOnly = false }) => {
    const { odontogramColors } = useConfigStore();
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

    // Status legend - Only RED (todo) and BLUE (done)
    const LEGEND = [
        { label: 'Por Hacer', color: '#EF4444', border: '#EF4444' },
        { label: 'Realizado', color: '#3B82F6', border: '#3B82F6' },
    ];

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

    // Count teeth with conditions - Only todo (red) and done (blue)
    const todoCount = Object.values(teeth).filter(t => t.status === 'todo' || Object.values(t.surfaces || {}).some(s => s === 'todo')).length;
    const doneCount = Object.values(teeth).filter(t => t.status === 'done' || Object.values(t.surfaces || {}).some(s => s === 'done')).length;

    const selectedToothState = selectedTooth ? getToothState(selectedTooth) : null;

    // Helper: surface condition labels
    const getSurfaceLabel = (surface) => {
        const labels = { vestibular: 'Vestibular (↑)', distal: 'Distal (→)', lingual: 'Lingual (↓)', mesial: 'Mesial (←)', oclusal: 'Oclusal (■)' };
        return labels[surface] || surface;
    };

    const getConditionBadge = (condition) => {
        const styles = {
            todo: 'bg-red-100 text-red-600 border-red-200',
            done: 'bg-blue-100 text-blue-600 border-blue-200',
        };
        return styles[condition] || 'bg-gray-100 text-gray-500 border-gray-200';
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
                            Por Hacer: {todoCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-500 font-semibold">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                            Realizado: {doneCount}
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
                                    Estado: <span className={clsx(
                                        "font-bold",
                                        selectedToothState?.status === 'todo' && 'text-red-500',
                                        selectedToothState?.status === 'done' && 'text-blue-500',
                                    )}>
                                        {selectedToothState?.status === 'todo' ? 'Por Hacer' : selectedToothState?.status === 'done' ? 'Realizado' : 'Sin acción'}
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
                                        onClick={() => { updateToothStatus(selectedTooth, 'done'); toast('Diente marcado como Realizado.'); }}
                                        className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded-lg font-bold transition-colors border border-blue-200"
                                    >
                                        ✓ Azul (Realizado)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { updateToothStatus(selectedTooth, 'todo'); toast('Diente marcado como Por Hacer.'); }}
                                        className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-lg font-bold transition-colors border border-red-200"
                                    >
                                        ✕ Rojo (Por Hacer)
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
