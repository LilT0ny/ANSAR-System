import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

const StatCard = ({ label, value, icon: Icon, variant = 'default', isLoading }: StatCardProps) => {
  const variants = {
    default: { color: 'text-blue-500', bg: 'bg-blue-50' },
    success: { color: 'text-green-500', bg: 'bg-green-50' },
    warning: { color: 'text-yellow-500', bg: 'bg-yellow-50' },
    danger: { color: 'text-red-500', bg: 'bg-red-50' },
    info: { color: 'text-purple-500', bg: 'bg-purple-50' },
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-0 sm:space-x-4 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className={clsx('p-3 rounded-xl shrink-0', variants[variant].bg)}>
        <Icon size={20} className={clsx(variants[variant].color, 'md:w-6 md:h-6')} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] md:text-sm font-bold text-gray-400 font-sans uppercase tracking-wider">{label}</p>
        <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-0.5 font-sans truncate">
          {isLoading ? '...' : value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;