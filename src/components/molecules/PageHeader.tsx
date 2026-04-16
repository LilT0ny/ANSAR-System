import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * Consistent page header component used across all main pages
 * Provides uniform styling for page titles and subtitles
 * 
 * @example
 * <PageHeader 
 *   title="Configuración"
 *   subtitle="Personaliza tu clínica dental"
 *   action={<SaveButton />}
 * />
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </header>
  );
};
