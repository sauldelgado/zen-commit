import React, { useState } from 'react';
import { Box, Text, Spinner, FileCategories, FileChangeFilters } from '../ui/components';
import { useGitChanges, useFileFilters } from '../ui/hooks';
import App, { renderApp } from '../ui/App';

const FileCategoriesDemo = () => {
  // Get current Git repo path (using process.cwd() for demo)
  const repoPath = process.cwd();

  // Use the Git changes hook
  const { changes, loading, error, refreshChanges } = useGitChanges(repoPath);

  // Use the filters hook
  const { activeFilters, groupByDirectory, handleFilterChange, toggleGroupByDirectory } =
    useFileFilters();

  // Show statistics
  const [showStats, setShowStats] = useState(true);

  // Key handler for the demo
  const handleKeyPress = React.useCallback(
    (input: string) => {
      // 'r' to refresh
      if (input === 'r') {
        refreshChanges();
      }
      // 'g' to toggle grouping
      else if (input === 'g') {
        toggleGroupByDirectory();
      }
      // 's' to toggle stats
      else if (input === 's') {
        setShowStats((prev) => !prev);
      }
      // 'q' to quit
      else if (input === 'q') {
        process.exit(0);
      }
    },
    [refreshChanges, toggleGroupByDirectory],
  );

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

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error loading Git changes:</Text>
        <Text color="red">{error.message}</Text>
      </Box>
    );
  }

  if (loading && changes.length === 0) {
    return (
      <Box padding={1}>
        <Spinner text="Loading Git changes..." />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Zen Commit - File Categorization Demo</Text>

      <Box marginY={1}>
        <Text>
          Press 'r' to refresh changes, 'g' to toggle grouping, 's' to toggle stats, 'q' to quit
        </Text>
      </Box>

      <FileChangeFilters activeFilters={activeFilters} onFilterChange={handleFilterChange} />

      <Box marginY={1}>
        <Text>Group by directory: </Text>
        <Text color={groupByDirectory ? 'green' : 'red'}>{groupByDirectory ? 'Yes' : 'No'}</Text>
      </Box>

      <FileCategories
        changes={changes}
        filters={activeFilters}
        groupByDirectory={groupByDirectory}
        showStats={showStats}
      />
    </Box>
  );
};

// Run the demo when this file is executed directly
if (require.main === module) {
  renderApp(
    <App>
      <FileCategoriesDemo />
    </App>,
  );
}

export default FileCategoriesDemo;
