import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';

export function useSearchFilter<T>(items: T[], searchKeys: (keyof T)[]) {
  const { searchTerm, filters } = useSearch();
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    let result = [...items];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(item =>
        searchKeys.some(key => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply additional filters
    if (filters.level) {
      result = result.filter((item: any) => 
        item.level?.toLowerCase() === filters.level.toLowerCase()
      );
    }

    if (filters.category) {
      result = result.filter((item: any) => 
        item.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      result = [...result].sort((a: any, b: any) => {
        switch (filters.sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'popular':
            return (b.reviews || 0) - (a.reviews || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredItems(result);
  }, [items, searchTerm, filters, searchKeys]);

  return filteredItems;
}