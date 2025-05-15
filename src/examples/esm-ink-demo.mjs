#!/usr/bin/env node
// This is a direct ESM file that bypasses typescript to test ink rendering

import React from 'react';
import { render, Box, Text } from 'ink';

// Simple component
const App = () => (
  <Box flexDirection="column" borderStyle="round" padding={1}>
    <Text bold>Ink Demo</Text>
    <Text color="green">Green Text</Text>
    <Text color="red">Red Text</Text>
    <Text color="blue">Blue Text</Text>
  </Box>
);

// Render the app
render(<App />);