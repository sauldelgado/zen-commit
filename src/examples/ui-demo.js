#!/usr/bin/env node
// UI components demo with the direct import approach that works

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

    // Demo component to showcase UI elements
    const UIDemo = () => {
      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          // Title
          React.createElement(Text, { bold: true, key: 'title' }, 'Zen Commit UI Demo'),

          // Divider for Text Styles
          React.createElement(Box, { marginY: 1, key: 'divider-1' }, [
            React.createElement(Text, { dimColor: true, key: 'div-line-1' }, '─'.repeat(10)),
            React.createElement(Text, { bold: true, key: 'div-title-1' }, ' Text Styles '),
            React.createElement(Text, { dimColor: true, key: 'div-line-2' }, '─'.repeat(10)),
          ]),

          // Text Style Examples
          React.createElement(
            Box,
            { flexDirection: 'column', marginBottom: 1, key: 'text-styles' },
            [
              React.createElement(Text, { bold: true, key: 'bold-text' }, 'Bold Text'),
              React.createElement(Text, { color: 'green', key: 'green-text' }, 'Green Text'),
              React.createElement(Text, { dimColor: true, key: 'dimmed-text' }, 'Dimmed Text'),
              React.createElement(Text, { italic: true, key: 'italic-text' }, 'Italic Text'),
              React.createElement(
                Text,
                { underline: true, key: 'underline-text' },
                'Underlined Text',
              ),
              React.createElement(
                Text,
                { strikethrough: true, key: 'strike-text' },
                'Strikethrough Text',
              ),
              React.createElement(Text, { color: 'red', key: 'red-text' }, 'Red Text'),
              React.createElement(Text, { color: 'yellow', key: 'yellow-text' }, 'Yellow Text'),
              React.createElement(Text, { color: 'blue', key: 'blue-text' }, 'Blue Text'),
              React.createElement(Text, { color: 'magenta', key: 'magenta-text' }, 'Magenta Text'),
              React.createElement(Text, { color: 'cyan', key: 'cyan-text' }, 'Cyan Text'),
              React.createElement(Text, { color: 'gray', key: 'gray-text' }, 'Gray Text'),
            ],
          ),

          // Divider for Box Layouts
          React.createElement(Box, { marginY: 1, key: 'divider-2' }, [
            React.createElement(Text, { dimColor: true, key: 'div-line-3' }, '─'.repeat(10)),
            React.createElement(Text, { bold: true, key: 'div-title-2' }, ' Box Layouts '),
            React.createElement(Text, { dimColor: true, key: 'div-line-4' }, '─'.repeat(10)),
          ]),

          // Box Layout Examples
          React.createElement(
            Box,
            {
              flexDirection: 'row',
              marginBottom: 1,
              borderStyle: 'single',
              key: 'row-box',
            },
            [
              React.createElement(Text, { key: 'row-item-1' }, 'Row Item 1'),
              React.createElement(Text, { key: 'row-item-2' }, 'Row Item 2'),
              React.createElement(Text, { key: 'row-item-3' }, 'Row Item 3'),
            ],
          ),

          React.createElement(
            Box,
            {
              flexDirection: 'column',
              marginBottom: 1,
              borderStyle: 'single',
              key: 'column-box',
            },
            [
              React.createElement(Text, { key: 'col-item-1' }, 'Column Item 1'),
              React.createElement(Text, { key: 'col-item-2' }, 'Column Item 2'),
              React.createElement(Text, { key: 'col-item-3' }, 'Column Item 3'),
            ],
          ),

          // Divider for Border Styles
          React.createElement(Box, { marginY: 1, key: 'divider-3' }, [
            React.createElement(Text, { dimColor: true, key: 'div-line-5' }, '─'.repeat(10)),
            React.createElement(Text, { bold: true, key: 'div-title-3' }, ' Border Styles '),
            React.createElement(Text, { dimColor: true, key: 'div-line-6' }, '─'.repeat(10)),
          ]),

          // Border Style Examples
          React.createElement(
            Box,
            {
              borderStyle: 'single',
              padding: 1,
              marginBottom: 1,
              key: 'single-border',
            },
            React.createElement(Text, {}, 'Single Border'),
          ),

          React.createElement(
            Box,
            {
              borderStyle: 'double',
              padding: 1,
              marginBottom: 1,
              key: 'double-border',
            },
            React.createElement(Text, {}, 'Double Border'),
          ),

          React.createElement(
            Box,
            {
              borderStyle: 'round',
              padding: 1,
              marginBottom: 1,
              key: 'round-border',
            },
            React.createElement(Text, {}, 'Round Border'),
          ),

          React.createElement(
            Box,
            {
              borderStyle: 'bold',
              padding: 1,
              marginBottom: 1,
              key: 'bold-border',
            },
            React.createElement(Text, {}, 'Bold Border'),
          ),

          // Demo Footer
          React.createElement(
            Box,
            { marginTop: 1, key: 'hint' },
            React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
          ),
        ],
      );
    };

    // Render the app
    console.log('Rendering UI Demo...');
    const { waitUntilExit } = render(React.createElement(UIDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
