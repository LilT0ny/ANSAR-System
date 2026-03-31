import { ReactNode } from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';
import Input from '../atoms/Input';

interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'date' | 'number' | 'tel' | 'select';
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  register?: any;
  options?: { value: string; label: string }[];
  className?: string;
  children?: ReactNode;
}

const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required,
  disabled,
  register,
  options,
  className,
  children,
}: FormFieldProps) => {
  if (type === 'select' && options) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          {...register?.(name)}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-2.5 border rounded-xl outline-none transition-all text-sm',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error ? 'border-red-500' : 'border-gray-300',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
      </div>
    );
  }

  if (children) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
      </div>
    );
  }

  return (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      error={error}
      required={required}
      disabled={disabled}
      {...register?.(name)}
      className={className}
    />
  );
};

export default FormField;