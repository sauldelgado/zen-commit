import React from 'react';
import { Box, Text } from '../ui/components';
import { FileCategories, FileChangeFilters } from '../ui/components';
import { FileChange } from '../git/change-detection/types';
import App, { renderApp } from '../ui/App';

// Sample file changes for testing
const sampleChanges: FileChange[] = [
  {
    path: 'src/index.ts',
    type: 'modified',
    staged: true,
    fileType: 'source',
    insertions: 5,
    deletions: 2,
  },
  {
    path: 'src/components/Button.tsx',
    type: 'modified',
    staged: true,
    fileType: 'source',
    insertions: 3,
    deletions: 1,
  },
  {
    path: 'README.md',
    type: 'modified',
    staged: true,
    fileType: 'docs',
    insertions: 10,
    deletions: 0,
  },
  {
    path: 'package.json',
    type: 'modified',
    staged: true,
    fileType: 'config',
    insertions: 1,
    deletions: 1,
  },
  {
    path: 'tests/test.ts',
    type: 'added',
    staged: true,
    fileType: 'test',
    insertions: 20,
    deletions: 0,
  },
  {
    path: 'assets/logo.png',
    type: 'added',
    staged: true,
    fileType: 'assets',
    insertions: 0,
    deletions: 0,
    binary: true,
  },
];

// Test component
const FileCategoriesTest = () => {
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [groupByDirectory, setGroupByDirectory] = React.useState(false);
  const [showStats, setShowStats] = React.useState(true);

  // Key handler
  const handleKeyPress = React.useCallback((input: string) => {
    // 'g' to toggle grouping
    if (input === 'g') {
      setGroupByDirectory((prev) => !prev);
    }
    // 's' to toggle stats
    else if (input === 's') {
      setShowStats((prev) => !prev);
    }
    // 'f' to add a filter
    else if (input === 'f') {
      setActiveFilters((prev) =>
        prev.includes('fileType:source')
          ? prev.filter((f) => f !== 'fileType:source')
          : [...prev, 'fileType:source'],
      );
    }
    // 'c' to add a change type filter
    else if (input === 'c') {
      setActiveFilters((prev) =>
        prev.includes('changeType:modified')
          ? prev.filter((f) => f !== 'changeType:modified')
          : [...prev, 'changeType:modified'],
      );
    }
    // 'q' to quit
    else if (input === 'q') {
      process.exit(0);
    }
  }, []);

  // Set up key listener
  React.useEffect(() => {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (data) => {
      const key = String(data);
      handleKeyPress(key);

      // Ctrl+C to exit
      if (key === '\u0003') {
        process.exit(0);
      }
    });

    return () => {
      process.stdin.setRawMode(false);
      process.stdin.off('data', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>File Categories Manual Test</Text>

      <Box marginY={1}>
        <Text>
          Press 'g' to toggle directory grouping, 's' to toggle stats, 'f' to toggle source filter,
          'c' to toggle modified filter, 'q' to quit
        </Text>
      </Box>

      <FileChangeFilters activeFilters={activeFilters} onFilterChange={setActiveFilters} />

      <Box marginY={1}>
        <Text>Group by directory: </Text>
        <Text color={groupByDirectory ? 'green' : 'red'}>{groupByDirectory ? 'Yes' : 'No'}</Text>
        <Text> | </Text>
        <Text>Show stats: </Text>
        <Text color={showStats ? 'green' : 'red'}>{showStats ? 'Yes' : 'No'}</Text>
      </Box>

      <FileCategories
        changes={sampleChanges}
        filters={activeFilters}
        groupByDirectory={groupByDirectory}
        showStats={showStats}
      />
    </Box>
  );
};

// Run the test when this file is executed directly
if (require.main === module) {
  renderApp(
    <App>
      <FileCategoriesTest />
    </App>,
  );
}

export default FileCategoriesTest;
