#!/usr/bin/env node
// Simple Ink demo that works directly with commonjs
// This is specially crafted to avoid module system conflicts

// Using a dynamic import for the react module
const reactPromise = import('react');
const inkPromise = import('ink');

// Use Promise.all to wait for both imports
Promise.all([reactPromise, inkPromise])
  .then(([reactModule, inkModule]) => {
    // Extract what we need from the modules
    const React = reactModule.default;
    const { render, Box, Text } = inkModule;

    // Define our component
    const App = () => {
      // Using JSX-like structure with React.createElement
      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        React.createElement(Text, { bold: true }, 'Direct Ink Demo'),
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
      );
    };

    // Render the App
    console.log('Rendering Ink app...');
    const { waitUntilExit } = render(React.createElement(App));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
