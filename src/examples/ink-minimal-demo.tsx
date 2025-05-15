import React from 'react';
import { Box, Text } from 'ink';
import { render } from 'ink';

const InkMinimalDemo = () => {
  return (
    <Box flexDirection="column" padding={1} borderStyle="round">
      <Text bold>Minimal Ink Demo</Text>
      <Box marginY={1}>
        <Text>This is a minimal demo using Ink directly</Text>
      </Box>
      <Box>
        <Text color="green">Green text</Text>
        <Text color="yellow">Yellow text</Text>
        <Text color="red">Red text</Text>
      </Box>
      <Box marginTop={1} borderStyle="single" padding={1}>
        <Text>This box should have a border</Text>
      </Box>
    </Box>
  );
};

// Check if this is the main module
if (require.main === module) {
  render(<InkMinimalDemo />);
}

export default InkMinimalDemo;
