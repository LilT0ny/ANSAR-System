import React from 'react';
import { motion } from 'framer-motion';
import { X as XIcon, Check } from 'lucide-react';
import clsx from 'clsx';
import useOdontogramStore from '../store/useOdontogramStore';

const SURFACE_NAMES = ['vestibular', 'distal', 'lingual', 'mesial', 'oclusal'];

// Color mapping based on condition
const CONDITION_COLORS = {
    healthy: '#FFFFFF',
    caries: '#EF4444',      // Red
    treated: '#8CC63E',     // Primary green
    missing: '#D1D5DB',     // Gray
    extraction: '#6D6E72',  // Dark gray
};

const CONDITION_HOVER = {
    healthy: '#F3F4F6',
    caries: '#DC2626',
    treated: '#7AB830',
    missing: '#9CA3AF',
};

const Tooth = ({ id, number, onSelect, activeTool, readOnly = false }) => {
    const toothData = useOdontogramStore((state) => state.teeth[id]) || { status: 'healthy', surfaces: {}, notes: '' };
    const isSelected = useOdontogramStore((state) => state.selectedTooth === id);
    const updateToothSurface = useOdontogramStore((state) => state.updateToothSurface);
    const updateToothStatus = useOdontogramStore((state) => state.updateToothStatus);

    const isMissing = toothData.status === 'missing';
    const isTreatedWhole = toothData.status === 'treated' && Object.keys(toothData.surfaces || {}).length === 0;
    const isCariesWhole = toothData.status === 'caries' && Object.keys(toothData.surfaces || {}).length === 0;
    const hasNotes = toothData.notes && toothData.notes.trim().length > 0;

    const handleSurfaceClick = (e, surface) => {
        e.stopPropagation();
        if (readOnly) return;

        if (activeTool === 'select') {
            // Just select the tooth
            onSelect(id);
            return;
        }

        if (activeTool === 'missing') {
            // Missing applies to whole tooth
            updateToothStatus(id, toothData.status === 'missing' ? 'healthy' : 'missing');
            return;
        }

        if (activeTool === 'healthy') {
            // Clear this surface
            updateToothSurface(id, surface, 'healthy');
            return;
        }

        // Apply tool condition to the clicked surface
        updateToothSurface(id, surface, activeTool);
    };

    const handleWholeToothClick = () => {
        if (readOnly) return;
        onSelect(id);
    };

    // Get the fill color for a specific surface
    const getSurfaceFill = (surface) => {
        // If whole tooth is missing, all surfaces are gray
        if (isMissing) return CONDITION_COLORS.missing;

        // If whole tooth is treated (no per-surface data)
        if (isTreatedWhole) return CONDITION_COLORS.treated;

        // If whole tooth has caries (no per-surface data)
        if (isCariesWhole) return CONDITION_COLORS.caries;

        // Per-surface condition
        const surfaceCondition = toothData.surfaces?.[surface];
        if (surfaceCondition && CONDITION_COLORS[surfaceCondition]) {
            return CONDITION_COLORS[surfaceCondition];
        }

        return CONDITION_COLORS.healthy;
    };

    // Get the stroke color for a surface (highlight when tool ready)
    const getStroke = (surface) => {
        if (readOnly) return '#D1D5DB';
        if (activeTool !== 'select' && activeTool !== 'missing') return '#9CA3AF';
        return '#D1D5DB';
    };

    return (
        <div className="flex flex-col items-center m-0.5 group relative">
            {/* Tooth Number */}
            <span className={clsx(
                "text-[10px] font-bold mb-0.5 font-sans transition-colors select-none",
                isSelected ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
            )}>
                {number}
            </span>

            <motion.div
                whileHover={readOnly ? {} : { scale: 1.15 }}
                whileTap={readOnly ? {} : { scale: 0.95 }}
                className={clsx(
                    "relative w-11 h-11 transition-all",
                    isSelected && "ring-2 ring-primary ring-offset-1 rounded-md shadow-md",
                    !readOnly && "cursor-pointer",
                    readOnly && "cursor-default"
                )}
                onClick={handleWholeToothClick}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Vestibular (Top) */}
                    <path
                        d="M 15 15 L 85 15 L 70 30 L 30 30 Z"
                        fill={getSurfaceFill('vestibular')}
                        stroke={getStroke('vestibular')}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && !isMissing && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'vestibular')}
                    />

                    {/* Distal (Right) */}
                    <path
                        d="M 85 15 L 85 85 L 70 70 L 70 30 Z"
                        fill={getSurfaceFill('distal')}
                        stroke={getStroke('distal')}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && !isMissing && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'distal')}
                    />

                    {/* Lingual (Bottom) */}
                    <path
                        d="M 85 85 L 15 85 L 30 70 L 70 70 Z"
                        fill={getSurfaceFill('lingual')}
                        stroke={getStroke('lingual')}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && !isMissing && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'lingual')}
                    />

                    {/* Mesial (Left) */}
                    <path
                        d="M 15 85 L 15 15 L 30 30 L 30 70 Z"
                        fill={getSurfaceFill('mesial')}
                        stroke={getStroke('mesial')}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && !isMissing && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'mesial')}
                    />

                    {/* Oclusal (Center) */}
                    <rect
                        x="30" y="30" width="40" height="40"
                        fill={getSurfaceFill('oclusal')}
                        stroke={getStroke('oclusal')}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && !isMissing && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'oclusal')}
                    />

                    {/* Missing X Overlay */}
                    {isMissing && (
                        <>
                            <line x1="12" y1="12" x2="88" y2="88" stroke="#6D6E72" strokeWidth="6" strokeLinecap="round" />
                            <line x1="88" y1="12" x2="12" y2="88" stroke="#6D6E72" strokeWidth="6" strokeLinecap="round" />
                        </>
                    )}

                    {/* Treated full-tooth checkmark */}
                    {isTreatedWhole && !isMissing && (
                        <g transform="translate(30, 30)">
                            <polyline
                                points="8,22 18,32 34,10"
                                fill="none"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    )}
                </svg>

                {/* Notes indicator */}
                {hasNotes && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" title="Tiene notas clínicas" />
                )}
            </motion.div>
        </div>
    );
};

export default Tooth;
