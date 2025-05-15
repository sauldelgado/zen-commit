#!/usr/bin/env node
// Diff view demo with the direct import approach that works

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

    // Mock diff data
    const mockDiffs = [
      {
        filePath: 'src/components/Button.js',
        status: 'modified',
        hunks: [
          {
            content:
              '@@ -15,7 +15,10 @@ const Button = ({ onClick, children, variant = "primary" }) => {',
            changes: [
              { content: '  return (', type: 'context' },
              { content: '    <button', type: 'context' },
              { content: '      onClick={onClick}', type: 'context' },
              { content: '      className={`btn btn-${variant}`}', type: 'removed' },
              { content: '      className={`btn btn-${variant} ${', type: 'added' },
              { content: '        variant === "primary" ? "btn-main" : ""', type: 'added' },
              { content: '      }`}', type: 'added' },
              { content: '      data-testid="button"', type: 'context' },
              { content: '    >', type: 'context' },
            ],
          },
        ],
      },
      {
        filePath: 'src/styles/theme.css',
        status: 'modified',
        hunks: [
          {
            content: '@@ -22,6 +22,12 @@',
            changes: [
              { content: '.btn {', type: 'context' },
              { content: '  padding: 8px 16px;', type: 'context' },
              { content: '  border-radius: 4px;', type: 'context' },
              { content: '  cursor: pointer;', type: 'context' },
              { content: '}', type: 'context' },
              { content: '', type: 'context' },
              { content: '.btn-main {', type: 'added' },
              { content: '  font-weight: bold;', type: 'added' },
              { content: '  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);', type: 'added' },
              { content: '}', type: 'added' },
              { content: '', type: 'context' },
            ],
          },
        ],
      },
      {
        filePath: 'README.md',
        status: 'modified',
        hunks: [
          {
            content: '@@ -42,6 +42,15 @@ npm start',
            changes: [
              { content: '## Features', type: 'context' },
              { content: '', type: 'context' },
              { content: '- Responsive design', type: 'context' },
              { content: '- Dark mode support', type: 'context' },
              { content: '- Accessibility optimized', type: 'added' },
              { content: '- Performance focused', type: 'added' },
              { content: '- Modern UI components', type: 'added' },
              { content: '', type: 'context' },
            ],
          },
          {
            content: '@@ -58,8 +67,6 @@ npm test',
            changes: [
              { content: '## License', type: 'context' },
              { content: '', type: 'context' },
              { content: 'MIT', type: 'context' },
              { content: '', type: 'context' },
              { content: '## Todo', type: 'removed' },
              { content: '- Add more tests', type: 'removed' },
              { content: '', type: 'context' },
            ],
          },
        ],
      },
    ];

    // Demo component
    const DiffViewDemo = () => {
      // Function to render a diff line with appropriate color
      const renderDiffLine = (line, index) => {
        let color = 'white';
        let prefix = ' ';

        if (line.type === 'added') {
          color = 'green';
          prefix = '+';
        } else if (line.type === 'removed') {
          color = 'red';
          prefix = '-';
        }

        return React.createElement(
          Text,
          { color, key: `line-${index}` },
          `${prefix} ${line.content}`,
        );
      };

      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          React.createElement(
            Text,
            { bold: true, key: 'title' },
            'Zen Commit - Diff Visualization Demo',
          ),

          ...mockDiffs.flatMap((file, fileIndex) => [
            // File Header
            React.createElement(
              Box,
              { marginTop: fileIndex > 0 ? 2 : 1, key: `file-${fileIndex}` },
              [
                React.createElement(Text, { bold: true, key: 'file-name' }, file.filePath),
                React.createElement(
                  Text,
                  {
                    color:
                      file.status === 'added'
                        ? 'green'
                        : file.status === 'deleted'
                          ? 'red'
                          : 'blue',
                    key: 'file-status',
                  },
                  ` (${file.status})`,
                ),
              ],
            ),

            // File Diff
            ...file.hunks.flatMap((hunk, hunkIndex) => [
              // Hunk Header
              React.createElement(
                Box,
                { marginTop: 1, key: `hunk-${fileIndex}-${hunkIndex}` },
                React.createElement(Text, { color: 'cyan' }, hunk.content),
              ),

              // Hunk Lines
              ...hunk.changes.map((line, lineIndex) =>
                React.createElement(
                  Box,
                  { key: `hunk-${fileIndex}-${hunkIndex}-line-${lineIndex}` },
                  renderDiffLine(line, lineIndex),
                ),
              ),
            ]),
          ]),

          React.createElement(
            Box,
            { marginTop: 2, key: 'stats' },
            React.createElement(
              Text,
              { dimColor: true },
              `Total: ${mockDiffs.length} files changed`,
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
    console.log('Rendering Diff View Demo...');
    const { waitUntilExit } = render(React.createElement(DiffViewDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
