import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
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
            const currentSurfaces = toothData.surfaces || [];
            const hasCondition = currentSurfaces.includes(part);
            let newSurfaces = hasCondition
                ? currentSurfaces.filter(s => s !== part)
                : [...currentSurfaces, part];

            updateTooth(id, { surfaces: newSurfaces, status: 'custom' });
            return;
        }

        onSelect(id);
    };

    const getColor = (part) => {
        if (toothData.surfaces?.includes(part)) return '#E2251D'; // Caries/Issue
        if (toothData.status === 'treated') return '#8CC63E';     // Treated entire tooth
        if (toothData.status === 'caries') return '#E2251D';      // Caries entires tooth
        if (toothData.status === 'missing') return '#00000000';   // Missing (handled differently)
        return 'white';
    };

    // If missing, show X over the whole area
    const isMissing = toothData.status === 'missing';

    return (
        <div className="flex flex-col items-center m-1 cursor-pointer group">
            <span className="text-xs text-secondary font-bold mb-1 font-sans">{number}</span>

            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                    "relative w-12 h-12 transition-all p-1", // 48x48
                    isSelected && "ring-2 ring-primary rounded-lg shadow-lg"
                )}
                onClick={() => onSelect(id)}
            >
                {/* SVG Tooth Representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm filter">
                    {/* Definitions for gradients/effects */}
                    <defs>
                        <filter id="shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2" />
                        </filter>
                    </defs>

                    {/* Background scaffold (gum/root context) if needed, otherwise just tooth */}

                    {/* Vestibular (Top) */}
                    <path
                        d="M 15 15 L 85 15 L 70 30 L 30 30 Z"
                        fill={getColor('vestibular')}
                        stroke="#DBDBDB"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all cursor-pointer"
                        onClick={(e) => handlePartClick(e, 'vestibular')}
                    />

                    {/* Distal (Right) */}
                    <path
                        d="M 85 15 L 85 85 L 70 70 L 70 30 Z"
                        fill={getColor('distal')}
                        stroke="#DBDBDB"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all cursor-pointer"
                        onClick={(e) => handlePartClick(e, 'distal')}
                    />

                    {/* Lingual (Bottom) */}
                    <path
                        d="M 85 85 L 15 85 L 30 70 L 70 70 Z"
                        fill={getColor('lingual')}
                        stroke="#DBDBDB"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all cursor-pointer"
                        onClick={(e) => handlePartClick(e, 'lingual')}
                    />

                    {/* Mesial (Left) */}
                    <path
                        d="M 15 85 L 15 15 L 30 30 L 30 70 Z"
                        fill={getColor('mesial')}
                        stroke="#DBDBDB"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all cursor-pointer"
                        onClick={(e) => handlePartClick(e, 'mesial')}
                    />

                    {/* Oclusal (Center) */}
                    <rect
                        x="30" y="30" width="40" height="40"
                        fill={getColor('oclusal')}
                        stroke="#DBDBDB"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-all cursor-pointer"
                        onClick={(e) => handlePartClick(e, 'oclusal')}
                    />

                    {/* Missing Overlay */}
                    {isMissing && (
                        <line x1="10" y1="10" x2="90" y2="90" stroke="#6D6E72" strokeWidth="8" strokeLinecap="round" />
                    )}
                    {isMissing && (
                        <line x1="90" y1="10" x2="10" y2="90" stroke="#6D6E72" strokeWidth="8" strokeLinecap="round" />
                    )}
                </svg>

                {/* Treated Indicator (e.g. checkmark icon if fully treated) */}
                {toothData.status === 'treated' && !isMissing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Check className="text-white drop-shadow-md" size={24} strokeWidth={3} />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Tooth;
