import { useState, useCallback } from 'react';
import { FileChange } from '../../git/change-detection/types';
import path from 'path';

/**
 * Hook for managing file filters
 * @returns Filter state and handlers
 */
export function useFileFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [groupByDirectory, setGroupByDirectory] = useState<boolean>(false);

  // Handle filter change
  const handleFilterChange = useCallback((filters: string[]) => {
    setActiveFilters(filters);
  }, []);

  // Toggle directory grouping
  const toggleGroupByDirectory = useCallback(() => {
    setGroupByDirectory((prev) => !prev);
  }, []);

  // Filter changes
  const filterChanges = useCallback(
    (changes: FileChange[]) => {
      if (activeFilters.length === 0) {
        return changes;
      }

      return changes.filter((change) => {
        // Check each filter
        for (const filter of activeFilters) {
          const [type, value] = filter.split(':');

          if (type === 'fileType' && change.fileType !== value) {
            return false;
          }

          if (type === 'changeType' && change.type !== value) {
            return false;
          }

          if (type === 'directory') {
            const dir = path.dirname(change.path);
            if (!dir.startsWith(value)) {
              return false;
            }
          }
        }

        return true;
      });
    },
    [activeFilters],
  );

  return {
    activeFilters,
    groupByDirectory,
    handleFilterChange,
    toggleGroupByDirectory,
    filterChanges,
  };
}
