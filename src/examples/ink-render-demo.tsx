import React from 'react';
import { Box, Text } from '../ui/components';
import App, { renderApp } from '../ui/App';

const InkRenderDemo = () => {
  return (
    <Box flexDirection="column" padding={1} borderStyle="round">
      <Text bold>Ink Rendering Test</Text>
      <Box marginY={1}>
        <Text>This should appear in your terminal with proper styling.</Text>
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

// Render using our renderApp helper
if (require.main === module) {
  renderApp(
    <App>
      <InkRenderDemo />
    </App>,
  );
}

// Export for testing
export default InkRenderDemo;
