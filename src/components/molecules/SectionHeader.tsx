import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  /** Pass-through className for layout flex tricks (e.g. flex-1) */
  className?: string;
  /** Optional action element (e.g., a button) to display on the right side */
  action?: React.ReactNode;
}

/**
 * Consistent section card header — matches the aesthetic of the PageHeader:
 * a pill/badge icon (green square, rounded) + bold title + optional subtitle.
 *
 * @example
 * <SectionHeader
 *   title="Listado de Pacientes"
 *   description="Todos los pacientes registrados"
 *   icon={Users}
 *   iconColor="text-primary"
 *   gradientFrom="from-primary/10"
 *   gradientTo="to-primary/5"
 *   action={<Button>Agregar</Button>}
 * />
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  gradientFrom = 'from-primary/10',
  gradientTo = 'to-primary/5',
  className = '',
  action,
}) => {
  // Derive a solid background for the icon badge from the iconColor class.
  // We use a bg that's always a lighter version of the icon color.
  const bgMap: Record<string, string> = {
    'text-primary':    'bg-primary/10',
    'text-blue-600':   'bg-blue-50',
    'text-blue-500':   'bg-blue-50',
    'text-purple-600': 'bg-purple-50',
    'text-purple-500': 'bg-purple-50',
    'text-yellow-500': 'bg-yellow-50',
    'text-green-600':  'bg-green-50',
    'text-green-500':  'bg-green-50',
    'text-red-500':    'bg-red-50',
    'text-gray-600':   'bg-gray-100',
    'text-gray-500':   'bg-gray-100',
  };
  const iconBg = bgMap[iconColor] ?? 'bg-gray-100';

  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Icon badge */}
        <div className={`${iconBg} p-2 rounded-lg shrink-0`}>
          <Icon className={iconColor} size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-serif font-bold text-gray-800 leading-tight truncate">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
};
