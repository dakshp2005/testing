import { Search } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

interface SearchBarProps {
  placeholder?: string;
}

function SearchBar({ placeholder = 'Search...' }: SearchBarProps) {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}

export default SearchBar;