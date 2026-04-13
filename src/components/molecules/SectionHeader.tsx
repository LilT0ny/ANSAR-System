import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * Reusable component for consistent section headers across the application
 * Used in settings sections, page headers, and dashboard sections
 * 
 * @example
 * <SectionHeader 
 *   title="Clínica"
 *   description="Información de la clínica"
 *   icon={Building}
 *   iconColor="text-primary"
 *   gradientFrom="from-primary/10"
 *   gradientTo="to-primary/5"
 * />
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  gradientFrom = 'from-primary/10',
  gradientTo = 'to-primary/5',
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-6 py-4 border-b border-gray-100`}>
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Icon className={iconColor} size={20} />
        {title}
      </h2>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};
