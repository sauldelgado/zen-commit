#!/usr/bin/env node
// This is a direct file that bypasses typescript to test ink rendering

// Using CommonJS syntax
const { render, Box, Text } = require('ink');
const React = require('react');

// Simple component
const App = () =>
  React.createElement(
    Box,
    { flexDirection: 'column', borderStyle: 'round', padding: 1 },
    React.createElement(Text, { bold: true }, 'Ink Demo'),
    React.createElement(Text, { color: 'green' }, 'Green Text'),
    React.createElement(Text, { color: 'red' }, 'Red Text'),
    React.createElement(Text, { color: 'blue' }, 'Blue Text'),
  );

// Render the app
render(React.createElement(App));
