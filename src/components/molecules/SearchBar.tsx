import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Buscar...', className }: SearchBarProps) => {
  return (
    <div className={`bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center space-x-3 border border-gray-100 ${className}`}>
      <Search className="text-gray-400 shrink-0" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;