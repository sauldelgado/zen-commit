#!/usr/bin/env node
// Staged files demo with JavaScript to avoid TypeScript issues

// Use dynamic import for ink to avoid ESM/CommonJS issues
(async () => {
  try {
    // Import the modules we need
    const inkModule = await import('ink');
    const reactModule = await import('react');
    const React = reactModule.default;
    const { useState, useEffect } = React;
    const { render } = inkModule;

    // Import our components
    const components = require('../ui/components');
    const { Box, Text, Spinner, StagedFilesList } = components;
    const hooks = require('../ui/hooks');
    const { useGitChanges } = hooks;
    const ThemeProvider = require('../ui/ThemeProvider').ThemeProvider;

    // Demo component using our UI components
    const StagedFilesDemo = () => {
      // Get current Git repo path (using process.cwd() for demo)
      const repoPath = process.cwd();

      // Use the Git changes hook
      const { changes, loading, error, refreshChanges } = useGitChanges(repoPath);

      // Set up key handler for refreshing
      useEffect(() => {
        const handleKeyPress = (data) => {
          const key = String(data);
          if (key === 'r') {
            console.log('Refreshing changes...');
            refreshChanges();
          }
          // Ctrl+C to exit
          if (key === '\u0003') {
            process.exit(0);
          }
        };

        process.stdin.setRawMode(true);
        process.stdin.on('data', handleKeyPress);

        return () => {
          process.stdin.setRawMode(false);
          process.stdin.off('data', handleKeyPress);
        };
      }, [refreshChanges]);

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
        React.createElement(Text, { bold: true }, 'Zen Commit - Staged Files Demo'),
        React.createElement(
          Box,
          { marginY: 1 },
          React.createElement(Text, {}, "Press 'r' to refresh changes, Ctrl+C to exit"),
        ),
        React.createElement(StagedFilesList, { changes: changes || [] }),
        React.createElement(StagedFilesList, {
          changes: changes || [],
          title: 'With Details',
          showDetails: true,
        }),
      );
    };

    // Render the app
    console.log('Starting staged-files demo...');
    const { waitUntilExit } = render(
      React.createElement(ThemeProvider, {}, React.createElement(StagedFilesDemo)),
    );

    // Wait for user to exit
    waitUntilExit().then(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
