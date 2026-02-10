import React, { useState } from 'react';
import useOdontogramStore from '../store/useOdontogramStore';
import Tooth from './Tooth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Activity, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const Odontogram = ({ patientId }) => {
    const teeth = useOdontogramStore((state) => state.teeth);
    const updateTooth = useOdontogramStore((state) => state.updateTooth);
    const selectedTooth = useOdontogramStore((state) => state.selectedTooth);
    const selectTooth = useOdontogramStore((state) => state.selectTooth);

    const [currentTool, setCurrentTool] = useState('select'); // 'caries', 'treated', 'missing'

    // Standard FDI Notation
    const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
    const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
    const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

    const handleToothClick = (id) => {
        selectTooth(id);
        if (currentTool !== 'select') {
            updateTooth(id, { status: currentTool });
        }
    };

    const getToothState = (id) => teeth[id] || { status: 'healthy' };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-gray-800">Odontograma Interactivo</h2>

                {/* Toolbar */}
                <div className="flex space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <ToolButton tool="caries" icon={Activity} color="text-red-500" current={currentTool} set={setCurrentTool} label="Caries" />
                    <ToolButton tool="treated" icon={Check} color="text-green-500" current={currentTool} set={setCurrentTool} label="Tratado" />
                    <ToolButton tool="missing" icon={X} color="text-gray-800" current={currentTool} set={setCurrentTool} label="Ausente" />
                    <ToolButton tool="healthy" icon={Trash2} color="text-blue-500" current={currentTool} set={setCurrentTool} label="Limpiar" />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-8">
                {/* Upper Arch */}
                <div className="flex space-x-8">
                    <div className="flex space-x-1 border-b-2 border-primary/20 pb-4">
                        {upperRight.map(num => <Tooth key={num} id={num} number={num} onSelect={handleToothClick} activeTool={currentTool} />)}
                    </div>
                    <div className="flex space-x-1 border-b-2 border-primary/20 pb-4">
                        {upperLeft.map(num => <Tooth key={num} id={num} number={num} onSelect={handleToothClick} activeTool={currentTool} />)}
                    </div>
                </div>

                {/* Lower Arch */}
                <div className="flex space-x-8">
                    <div className="flex space-x-1 border-t-2 border-primary/20 pt-4">
                        {lowerRight.map(num => <Tooth key={num} id={num} number={num} onSelect={handleToothClick} activeTool={currentTool} />)}
                    </div>
                    <div className="flex space-x-1 border-t-2 border-primary/20 pt-4">
                        {lowerLeft.map(num => <Tooth key={num} id={num} number={num} onSelect={handleToothClick} activeTool={currentTool} />)}
                    </div>
                </div>
            </div>

            {/* Selected Tooth Details Popup */}
            <AnimatePresence>
                {selectedTooth && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-serif font-bold">Diente #{selectedTooth}</h3>
                            <button onClick={() => selectTooth(null)}><X size={16} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Estado: <span className="font-medium text-gray-800 capitalize">{getToothState(selectedTooth).status}</span></p>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            placeholder="Notas clínicas..."
                            rows={3}
                        />
                        <button className="w-full mt-2 bg-primary text-white text-sm py-1 rounded hover:opacity-90 transition">
                            Guardar Notas
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ToolButton = ({ tool, icon: Icon, color, current, set, label }) => (
    <button
        onClick={() => set(tool)}
        className={clsx(
            "p-2 rounded transition-all flex items-center space-x-1",
            current === tool ? "bg-white shadow-sm ring-1 ring-gray-200" : "hover:bg-gray-200"
        )}
        title={label}
    >
        <Icon size={18} className={color} />
        {current === tool && <span className="text-xs font-medium text-gray-600">{label}</span>}
    </button>
);

export default Odontogram;
