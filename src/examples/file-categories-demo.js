#!/usr/bin/env node
// File categories demo with JavaScript to avoid TypeScript issues

// Use dynamic import for ink to avoid ESM/CommonJS issues
(async () => {
  try {
    // Import the modules we need
    const inkModule = await import('ink');
    const reactModule = await import('react');
    const React = reactModule.default;
    const { useState, useEffect, useCallback } = React;
    const { render } = inkModule;

    // Import our components
    const components = require('../ui/components');
    const { Box, Text, Spinner, FileCategories, FileChangeFilters } = components;
    const hooks = require('../ui/hooks');
    const { useGitChanges, useFileFilters } = hooks;
    const ThemeProvider = require('../ui/ThemeProvider').ThemeProvider;

    // Demo component using our UI components
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
      const handleKeyPress = useCallback(
        (data) => {
          const key = String(data);
          // 'r' to refresh
          if (key === 'r') {
            console.log('Refreshing changes...');
            refreshChanges();
          }
          // 'g' to toggle grouping
          else if (key === 'g') {
            toggleGroupByDirectory();
          }
          // 's' to toggle stats
          else if (key === 's') {
            setShowStats((prev) => !prev);
          }
          // 'q' to quit
          else if (key === 'q' || key === '\u0003') {
            process.exit(0);
          }
        },
        [refreshChanges, toggleGroupByDirectory],
      );

      // Set up key listener
      useEffect(() => {
        process.stdin.setRawMode(true);
        process.stdin.on('data', handleKeyPress);

        return () => {
          process.stdin.setRawMode(false);
          process.stdin.off('data', handleKeyPress);
        };
      }, [handleKeyPress]);

      if (error) {
        return React.createElement(
          Box,
          { flexDirection: 'column', padding: 1 },
          React.createElement(Text, { color: 'red' }, 'Error loading Git changes:'),
          React.createElement(Text, { color: 'red' }, error.message),
        );
      }

      if (loading && (!changes || changes.length === 0)) {
        return React.createElement(
          Box,
          { padding: 1 },
          React.createElement(Spinner, { text: 'Loading Git changes...' }),
        );
      }

      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1 },
        React.createElement(Text, { bold: true }, 'Zen Commit - File Categorization Demo'),
        React.createElement(
          Box,
          { marginY: 1 },
          React.createElement(
            Text,
            {},
            "Press 'r' to refresh changes, 'g' to toggle grouping, 's' to toggle stats, 'q' to quit",
          ),
        ),
        React.createElement(FileChangeFilters, {
          activeFilters: activeFilters,
          onFilterChange: handleFilterChange,
        }),
        React.createElement(
          Box,
          { marginY: 1 },
          React.createElement(Text, {}, 'Group by directory: '),
          React.createElement(
            Text,
            { color: groupByDirectory ? 'green' : 'red' },
            groupByDirectory ? 'Yes' : 'No',
          ),
        ),
        React.createElement(FileCategories, {
          changes: changes || [],
          filters: activeFilters,
          groupByDirectory: groupByDirectory,
          showStats: showStats,
        }),
      );
    };

    // Render the app
    console.log('Starting file-categories demo...');
    const { waitUntilExit } = render(
      React.createElement(ThemeProvider, {}, React.createElement(FileCategoriesDemo)),
    );

    // Wait for user to exit
    waitUntilExit().then(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
