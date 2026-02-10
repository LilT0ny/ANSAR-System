import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
import useOdontogramStore from '../store/useOdontogramStore';

const DEFAULT_TOOTH_DATA = { status: 'healthy', surfaces: [] };

const Tooth = ({ id, number, onSelect, activeTool }) => {
    const toothData = useOdontogramStore((state) => state.teeth[id] || DEFAULT_TOOTH_DATA);
    const isSelected = useOdontogramStore((state) => state.selectedTooth === id);
    const updateTooth = useOdontogramStore((state) => state.updateTooth);

    const handlePartClick = (e, part) => {
        e.stopPropagation();

        if (activeTool !== 'select') {
            // Toggle surface logic
            const currentSurfaces = toothData.surfaces || [];
            const hasCondition = currentSurfaces.includes(part);

            let newSurfaces;
            if (hasCondition) {
                newSurfaces = currentSurfaces.filter(s => s !== part);
            } else {
                newSurfaces = [...currentSurfaces, part];
            }

            updateTooth(id, { surfaces: newSurfaces, status: 'custom' }); // custom indicates mixed state
            return;
        }

        onSelect(id);
    };

    const getColor = (part) => {
        if (toothData.surfaces?.includes(part)) return '#E2251D'; // Default red for surface issues

        if (toothData.status === 'missing') return '#000000';
        if (toothData.status === 'treated') return '#8CC63E';
        if (toothData.status === 'caries') return '#E2251D';

        return '#FFFFFF';
    };

    return (
        <div className="flex flex-col items-center m-1 cursor-pointer">
            <span className="text-xs text-secondary font-bold mb-1">{number}</span>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={clsx("relative w-12 h-12 border-2 transition-all bg-white", isSelected ? "border-blue-500 shadow-lg ring-2 ring-blue-200" : "border-gray-200")}
                onClick={() => onSelect(id)}
            >
                {/* Top (Vestibular) */}
                <div
                    onClick={(e) => handlePartClick(e, 'vestibular')}
                    style={{ backgroundColor: getColor('vestibular') }}
                    className="absolute top-0 left-1/4 w-1/2 h-1/4 border-b border-gray-200 hover:opacity-80 transition-colors"
                ></div>
                {/* Bottom (Lingual) */}
                <div
                    onClick={(e) => handlePartClick(e, 'lingual')}
                    style={{ backgroundColor: getColor('lingual') }}
                    className="absolute bottom-0 left-1/4 w-1/2 h-1/4 border-t border-gray-200 hover:opacity-80 transition-colors"
                ></div>
                {/* Left (Mesial) */}
                <div
                    onClick={(e) => handlePartClick(e, 'mesial')}
                    style={{ backgroundColor: getColor('mesial') }}
                    className="absolute left-0 top-1/4 w-1/4 h-1/2 border-r border-gray-200 hover:opacity-80 transition-colors"
                ></div>
                {/* Right (Distal) */}
                <div
                    onClick={(e) => handlePartClick(e, 'distal')}
                    style={{ backgroundColor: getColor('distal') }}
                    className="absolute right-0 top-1/4 w-1/4 h-1/2 border-l border-gray-200 hover:opacity-80 transition-colors"
                ></div>
                {/* Center (Oclusal) */}
                <div
                    onClick={(e) => handlePartClick(e, 'oclusal')}
                    style={{ backgroundColor: getColor('oclusal') }}
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    {toothData.status === 'missing' && <X size={24} className="text-white" />}
                </div>
            </motion.div>
        </div>
    );
};

export default Tooth;
