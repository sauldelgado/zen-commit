#!/usr/bin/env node
const React = require('react');
const { render, Box, Text } = require('ink');

const PureInkDemo = () => {
  return React.createElement(
    Box,
    { flexDirection: 'column', padding: 1, borderStyle: 'round' },
    React.createElement(Text, { bold: true }, 'Pure Ink Rendering Test'),
    React.createElement(
      Box,
      { marginY: 1 },
      React.createElement(Text, {}, 'This should appear in your terminal with proper styling.'),
    ),
    React.createElement(
      Box,
      {},
      React.createElement(Text, { color: 'green' }, 'Green text'),
      React.createElement(Text, { color: 'yellow' }, 'Yellow text'),
      React.createElement(Text, { color: 'red' }, 'Red text'),
    ),
    React.createElement(
      Box,
      { marginTop: 1, borderStyle: 'single', padding: 1 },
      React.createElement(Text, {}, 'This box should have a border'),
    ),
  );
};

// Direct render with Ink
render(React.createElement(PureInkDemo));
