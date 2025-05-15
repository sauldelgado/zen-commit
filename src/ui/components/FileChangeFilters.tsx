import React from 'react';
import { Box, Text } from './';

/**
 * Filter option
 */
interface FilterOption {
  id: string;
  label: string;
  group: string;
}

/**
 * Default filter options
 */
const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  // Change type filters
  { id: 'changeType:added', label: 'Added', group: 'Change Type' },
  { id: 'changeType:modified', label: 'Modified', group: 'Change Type' },
  { id: 'changeType:deleted', label: 'Deleted', group: 'Change Type' },
  { id: 'changeType:renamed', label: 'Renamed', group: 'Change Type' },

  // File type filters
  { id: 'fileType:source', label: 'Source', group: 'File Type' },
  { id: 'fileType:test', label: 'Tests', group: 'File Type' },
  { id: 'fileType:docs', label: 'Docs', group: 'File Type' },
  { id: 'fileType:config', label: 'Config', group: 'File Type' },
  { id: 'fileType:assets', label: 'Assets', group: 'File Type' },

  // Directory filters (these would be dynamic in practice)
  { id: 'directory:src', label: 'src/', group: 'Directory' },
  { id: 'directory:tests', label: 'tests/', group: 'Directory' },
];

export interface FileChangeFiltersProps {
  activeFilters: string[];
  options?: FilterOption[];
  onFilterChange: (filters: string[]) => void;
}

/**
 * Component for filtering file changes
 */
const FileChangeFilters = ({
  activeFilters,
  options = DEFAULT_FILTER_OPTIONS,
  onFilterChange,
}: FileChangeFiltersProps) => {
  // Group options by group
  const groupedOptions: Record<string, FilterOption[]> = {};

  for (const option of options) {
    if (!groupedOptions[option.group]) {
      groupedOptions[option.group] = [];
    }

    groupedOptions[option.group].push(option);
  }

  // Toggle a filter
  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      onFilterChange(activeFilters.filter((id) => id !== filterId));
    } else {
      onFilterChange([...activeFilters, filterId]);
    }
  };

  return (
    <Box flexDirection="column">
      {Object.entries(groupedOptions).map(([group, groupOptions]) => (
        <Box key={group} flexDirection="column" marginBottom={1}>
          <Text bold>{group}</Text>

          <Box flexDirection="row" flexWrap="wrap" marginLeft={2}>
            {groupOptions.map((option) => (
              <Box
                key={option.id}
                marginRight={2}
                borderStyle={activeFilters.includes(option.id) ? 'single' : undefined}
                padding={activeFilters.includes(option.id) ? 1 : 0}
              >
                <Text
                  color={activeFilters.includes(option.id) ? 'green' : 'white'}
                  bold={activeFilters.includes(option.id)}
                  dimColor={!activeFilters.includes(option.id)}
                  onClick={() => toggleFilter(option.id)}
                >
                  {option.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FileChangeFilters;
