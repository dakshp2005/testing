import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: {
    level?: string;
    category?: string;
    sortBy?: string;
  };
  setFilters: (filters: any) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  return (
    <SearchContext.Provider value={{ 
      searchTerm, 
      setSearchTerm,
      filters,
      setFilters
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}