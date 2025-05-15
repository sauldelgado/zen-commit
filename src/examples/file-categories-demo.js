#!/usr/bin/env node
// File categories demo with the direct import approach that works

// Using dynamic imports with Promise.all to avoid ESM/CommonJS issues
const reactPromise = import('react');
const inkPromise = import('ink');

// Use Promise.all to wait for all imports
Promise.all([reactPromise, inkPromise])
  .then(([reactModule, inkModule]) => {
    // Extract what we need from the modules
    const React = reactModule.default;
    const { useState } = reactModule;
    const { render, Box, Text } = inkModule;

    // Simple mock data for file changes
    const mockChanges = [
      { filePath: 'src/components/Header.js', status: 'modified' },
      { filePath: 'src/components/Footer.js', status: 'modified' },
      { filePath: 'src/pages/Home.js', status: 'added' },
      { filePath: 'src/utils/helpers.js', status: 'added' },
      { filePath: 'src/styles/main.css', status: 'deleted' },
      { filePath: 'README.md', status: 'modified' },
      { filePath: 'package.json', status: 'modified' },
    ];

    // Demo component
    const FileCategoriesDemo = () => {
      // State for simulating group by directory
      const [groupByDirectory, setGroupByDirectory] = useState(true);

      // Generate categorized file lists
      const categories = {
        added: mockChanges.filter((file) => file.status === 'added'),
        modified: mockChanges.filter((file) => file.status === 'modified'),
        deleted: mockChanges.filter((file) => file.status === 'deleted'),
      };

      // Display files by category or grouped by directory
      const renderFileList = (files, color) => {
        if (groupByDirectory) {
          // Group files by directory
          const directories = {};
          files.forEach((file) => {
            const dir = file.filePath.includes('/')
              ? file.filePath.substring(0, file.filePath.lastIndexOf('/'))
              : 'root';

            if (!directories[dir]) {
              directories[dir] = [];
            }
            directories[dir].push(file);
          });

          return Object.entries(directories)
            .map(([dir, dirFiles], dirIndex) => {
              return [
                React.createElement(Text, { color: 'yellow', key: `dir-${dirIndex}` }, dir),
                ...dirFiles.map((file, fileIndex) => {
                  const fileName = file.filePath.substring(file.filePath.lastIndexOf('/') + 1);
                  return React.createElement(
                    Box,
                    { paddingLeft: 2, key: `file-${dirIndex}-${fileIndex}` },
                    React.createElement(Text, { color }, fileName),
                  );
                }),
              ];
            })
            .flat();
        } else {
          // Just list files without grouping
          return files.map((file, index) =>
            React.createElement(Text, { color, key: `file-${index}` }, file.filePath),
          );
        }
      };

      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          React.createElement(
            Text,
            { bold: true, key: 'title' },
            'Zen Commit - File Categorization Demo',
          ),

          React.createElement(Box, { marginY: 1, key: 'grouping' }, [
            React.createElement(Text, { key: 'groupLabel' }, 'Group by directory: '),
            React.createElement(
              Text,
              { color: groupByDirectory ? 'green' : 'red', key: 'groupValue' },
              groupByDirectory ? 'Yes' : 'No',
            ),
          ]),

          React.createElement(
            Box,
            { marginY: 1, key: 'controls' },
            React.createElement(
              Text,
              {},
              "Press 'g' to toggle grouping (simulated), Ctrl+C to exit",
            ),
          ),

          // Added Files
          React.createElement(
            Box,
            { flexDirection: 'column', marginTop: 1, key: 'added-section' },
            [
              React.createElement(
                Text,
                { bold: true, color: 'green', key: 'added-header' },
                `Added Files (${categories.added.length})`,
              ),
              ...renderFileList(categories.added, 'green'),
            ],
          ),

          // Modified Files
          React.createElement(
            Box,
            { flexDirection: 'column', marginTop: 1, key: 'modified-section' },
            [
              React.createElement(
                Text,
                { bold: true, color: 'blue', key: 'modified-header' },
                `Modified Files (${categories.modified.length})`,
              ),
              ...renderFileList(categories.modified, 'blue'),
            ],
          ),

          // Deleted Files
          React.createElement(
            Box,
            { flexDirection: 'column', marginTop: 1, key: 'deleted-section' },
            [
              React.createElement(
                Text,
                { bold: true, color: 'red', key: 'deleted-header' },
                `Deleted Files (${categories.deleted.length})`,
              ),
              ...renderFileList(categories.deleted, 'red'),
            ],
          ),

          // Stats Footer
          React.createElement(
            Box,
            { marginTop: 2, key: 'stats' },
            React.createElement(
              Text,
              { dimColor: true },
              `Total: ${mockChanges.length} files (${categories.added.length} added, ${categories.modified.length} modified, ${categories.deleted.length} deleted)`,
            ),
          ),

          React.createElement(
            Box,
            { marginTop: 1, key: 'hint' },
            React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
          ),
        ],
      );
    };

    // Render the app
    console.log('Rendering File Categories Demo...');
    const { waitUntilExit } = render(React.createElement(FileCategoriesDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
