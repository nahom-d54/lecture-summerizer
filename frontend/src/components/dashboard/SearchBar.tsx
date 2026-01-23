import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const [input, setInput] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(input);
  };

  const handleClear = () => {
    setInput('');
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Search your recordings..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="pl-12 pr-12 h-12 bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-base rounded-xl"
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
