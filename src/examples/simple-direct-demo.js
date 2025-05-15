#!/usr/bin/env node
// This is a super simple demo that directly renders components,
// bypassing all the TypeScript issues

// Import the modules we need
const inkLibrary = require('ink');
const React = require('react');
const { Box, Text } = inkLibrary;

// Simple demo component using Ink directly
const Demo = () => {
  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1, borderStyle: 'round' },
    React.createElement(Text, { bold: true }, 'Simple Direct Demo'),
    React.createElement(
      Box,
      { marginY: 1 },
      React.createElement(Text, {}, 'This should appear in your terminal with proper styling'),
    ),
    React.createElement(
      Box,
      {},
      React.createElement(Text, { color: 'green' }, 'Green Text'),
      React.createElement(Text, { color: 'red' }, 'Red Text'),
      React.createElement(Text, { color: 'blue' }, 'Blue Text'),
    ),
    React.createElement(
      Box,
      { marginTop: 1 },
      React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
    ),
  );
};

// Render directly using Ink
const { waitUntilExit } = inkLibrary.render(React.createElement(Demo));

// Wait for exit
waitUntilExit().then(() => {
  process.exit(0);
});
