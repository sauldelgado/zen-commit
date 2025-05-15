#!/usr/bin/env node
// Staged files demo with the direct import approach that works

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

    // Mock staged files data
    const mockStagedFiles = [
      { filePath: 'src/components/Button.js', status: 'staged', linesAdded: 15, linesRemoved: 5 },
      { filePath: 'src/components/Card.js', status: 'staged', linesAdded: 22, linesRemoved: 11 },
      { filePath: 'src/pages/Dashboard.js', status: 'staged', linesAdded: 47, linesRemoved: 23 },
      { filePath: 'src/utils/format.js', status: 'staged', linesAdded: 8, linesRemoved: 3 },
      { filePath: 'README.md', status: 'staged', linesAdded: 12, linesRemoved: 4 },
    ];

    // Demo component
    const StagedFilesDemo = () => {
      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          React.createElement(Text, { bold: true, key: 'title' }, 'Zen Commit - Staged Files Demo'),

          // Simple list (without details)
          React.createElement(
            Box,
            { flexDirection: 'column', marginY: 1, key: 'simple-list-section' },
            [
              React.createElement(Text, { bold: true, key: 'simple-header' }, 'Staged Files'),
              ...mockStagedFiles.map((file, index) =>
                React.createElement(
                  Box,
                  { key: `simple-file-${index}` },
                  React.createElement(Text, { color: 'green' }, `• ${file.filePath}`),
                ),
              ),
            ],
          ),

          // Divider
          React.createElement(
            Box,
            { marginY: 1, key: 'divider' },
            React.createElement(Text, { color: 'gray' }, '─'.repeat(50)),
          ),

          // Detailed list (with stats)
          React.createElement(
            Box,
            { flexDirection: 'column', marginY: 1, key: 'detailed-list-section' },
            [
              React.createElement(
                Text,
                { bold: true, key: 'detailed-header' },
                'Staged Files (With Details)',
              ),
              ...mockStagedFiles.map((file, index) => {
                const fileName = file.filePath.includes('/')
                  ? file.filePath.split('/').pop()
                  : file.filePath;
                const dirPath = file.filePath.includes('/')
                  ? file.filePath.substring(0, file.filePath.lastIndexOf('/'))
                  : '';

                return React.createElement(
                  Box,
                  { flexDirection: 'column', marginBottom: 1, key: `detailed-file-${index}` },
                  [
                    React.createElement(
                      Box,
                      { key: `detailed-file-path-${index}` },
                      [
                        React.createElement(Text, { color: 'green', key: `bullet-${index}` }, '•'),
                        React.createElement(
                          Text,
                          { bold: true, key: `name-${index}` },
                          ` ${fileName}`,
                        ),
                        dirPath
                          ? React.createElement(
                              Text,
                              { color: 'gray', key: `dir-${index}` },
                              ` (${dirPath})`,
                            )
                          : null,
                      ].filter(Boolean),
                    ),
                    React.createElement(
                      Box,
                      { paddingLeft: 2, key: `detailed-file-stats-${index}` },
                      [
                        React.createElement(
                          Text,
                          { color: 'green', key: `added-${index}` },
                          `+${file.linesAdded}`,
                        ),
                        React.createElement(
                          Text,
                          { color: 'gray', key: `separator-${index}` },
                          ' / ',
                        ),
                        React.createElement(
                          Text,
                          { color: 'red', key: `removed-${index}` },
                          `-${file.linesRemoved}`,
                        ),
                      ],
                    ),
                  ],
                );
              }),
            ],
          ),

          // Summary stats
          React.createElement(
            Box,
            { marginTop: 2, key: 'stats' },
            React.createElement(
              Text,
              { dimColor: true },
              `Total: ${mockStagedFiles.length} files, ${mockStagedFiles.reduce(
                (sum, file) => sum + file.linesAdded,
                0,
              )} lines added, ${mockStagedFiles.reduce(
                (sum, file) => sum + file.linesRemoved,
                0,
              )} lines removed`,
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
    console.log('Rendering Staged Files Demo...');
    const { waitUntilExit } = render(React.createElement(StagedFilesDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
