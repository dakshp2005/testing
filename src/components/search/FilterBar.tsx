import { Filter } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

interface FilterBarProps {
  options: {
    levels?: string[];
    categories?: string[];
    sortOptions?: string[];
  };
}

function FilterBar({ options }: FilterBarProps) {
  const { filters, setFilters } = useSearch();

  return (
    <div className="flex gap-4">
      <button className="btn-secondary flex items-center">
        <Filter className="w-5 h-5 mr-2" /> Filter
      </button>
      
      {options.levels && (
        <select
          value={filters.level || ''}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Levels</option>
          {options.levels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      )}
      
      {options.categories && (
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {options.categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      )}
      
      {options.sortOptions && (
        <select
          value={filters.sortBy || ''}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Sort By</option>
          {options.sortOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default FilterBar;