#!/usr/bin/env node
// A simple demo using Ink directly with JavaScript

// We use dynamic import to avoid ESM/CommonJS issues
(async () => {
  try {
    // Import the modules we need
    const inkModule = await import('ink');
    const reactModule = await import('react');

    // Get the render function from Ink
    const { render, Box, Text } = inkModule;
    const React = reactModule.default;

    // Create a simple app using React.createElement
    const App = () => {
      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        React.createElement(Text, { bold: true }, 'Simple Ink Demo'),
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

    // Render the app
    const instance = render(React.createElement(App));

    // Wait for exit
    instance.waitUntilExit().then(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
