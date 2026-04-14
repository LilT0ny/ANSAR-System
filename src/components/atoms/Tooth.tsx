import React from 'react';
import { motion } from 'framer-motion';
import { X as XIcon, Check } from 'lucide-react';
import clsx from 'clsx';
import useOdontogramStore from '../../store/useOdontogramStore';
import useConfigStore from '../../store/useConfigStore';

const SURFACE_NAMES = ['vestibular', 'distal', 'lingual', 'mesial', 'oclusal'];

const Tooth = ({ id, number, onSelect, activeTool, readOnly = false }) => {
    const { odontogramColors } = useConfigStore();
    const toothData = useOdontogramStore((state) => state.teeth[id]) || { status: 'healthy', surfaces: {}, notes: '' };
    const isSelected = useOdontogramStore((state) => state.selectedTooth === id);
    const updateToothSurface = useOdontogramStore((state) => state.updateToothSurface);
    const updateToothStatus = useOdontogramStore((state) => state.updateToothStatus);

    const CONDITION_COLORS = {
        todo: '#EF4444',   // Rojo - Por hacer
        done: '#3B82F6',  // Azul - Realizado
    };

    const CONDITION_HOVER = {
        todo: '#DC2626',
        done: '#2563EB',
    };

    const isTodo = toothData.status === 'todo';
    const isDone = toothData.status === 'done';
    const hasNotes = toothData.notes && toothData.notes.trim().length > 0;

    const handleSurfaceClick = (e, surface) => {
        e.stopPropagation();
        if (readOnly) return;

        if (activeTool === 'select') {
            onSelect(id);
            return;
        }

        if (activeTool === 'clean') {
            updateToothSurface(id, surface, null);
            return;
        }

        if (activeTool === 'todo' || activeTool === 'done') {
            updateToothSurface(id, surface, activeTool);
        }
    };

    const handleWholeToothClick = () => {
        if (readOnly) return;
        onSelect(id);
    };

    // Get the fill color for a specific surface - Only RED and BLUE
    const getSurfaceFill = (surface) => {
        if (isDone) return CONDITION_COLORS.done;
        if (isTodo) return CONDITION_COLORS.todo;
        
        const surfaceCondition = toothData.surfaces?.[surface];
        if (surfaceCondition === 'done') return CONDITION_COLORS.done;
        if (surfaceCondition === 'todo') return CONDITION_COLORS.todo;
        
        return '#FFFFFF'; // Default white
    };

    // Get the stroke color
    const getStroke = () => {
        if (readOnly) return '#D1D5DB';
        if (activeTool === 'select') return '#D1D5DB';
        return '#9CA3AF';
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
                        stroke={getStroke()}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'vestibular')}
                    />

                    {/* Distal (Right) */}
                    <path
                        d="M 85 15 L 85 85 L 70 70 L 70 30 Z"
                        fill={getSurfaceFill('distal')}
                        stroke={getStroke()}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'distal')}
                    />

                    {/* Lingual (Bottom) */}
                    <path
                        d="M 85 85 L 15 85 L 30 70 L 70 70 Z"
                        fill={getSurfaceFill('lingual')}
                        stroke={getStroke()}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'lingual')}
                    />

                    {/* Mesial (Left) */}
                    <path
                        d="M 15 85 L 15 15 L 30 30 L 30 70 Z"
                        fill={getSurfaceFill('mesial')}
                        stroke={getStroke()}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'mesial')}
                    />

                    {/* Oclusal (Center) */}
                    <rect
                        x="30" y="30" width="40" height="40"
                        fill={getSurfaceFill('oclusal')}
                        stroke={getStroke()}
                        strokeWidth="1.5"
                        className={clsx(
                            "transition-all duration-150",
                            !readOnly && "hover:brightness-90 cursor-pointer"
                        )}
                        onClick={(e) => handleSurfaceClick(e, 'oclusal')}
                    />

                    {/* Checkmark for DONE (blue) whole tooth */}
                    {isDone && (
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
