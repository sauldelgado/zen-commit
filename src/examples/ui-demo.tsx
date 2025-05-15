import React, { useState } from 'react';
import { Box, Text, Input, Select, Spinner, Divider, App, renderApp } from '../ui';

const UIDemo = () => {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState('');
  
  const items = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
  
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Zen Commit UI Demo</Text>
      
      <Divider title="Text Styles" />
      
      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Bold Text</Text>
        <Text color="green">Green Text</Text>
        <Text dim>Dimmed Text</Text>
        <Text italic>Italic Text</Text>
      </Box>
      
      <Divider title="Input Component" />
      
      <Input
        label="Enter some text:"
        value={input}
        onChange={setInput}
        placeholder="Type something..."
      />
      
      <Box marginTop={1}>
        <Text>You entered: {input}</Text>
      </Box>
      
      <Divider title="Select Component" />
      
      <Select
        label="Choose an option:"
        items={items}
        onSelect={(item) => setSelected(item.value)}
      />
      
      <Box marginTop={1}>
        <Text>You selected: {selected}</Text>
      </Box>
      
      <Divider title="Spinner Component" />
      
      <Box marginY={1}>
        <Spinner text="Loading..." />
      </Box>
      <Box marginY={1}>
        <Spinner type="line" text="Processing..." />
      </Box>
      <Box marginY={1}>
        <Spinner type="clock" text="Waiting..." />
      </Box>
    </Box>
  );
};

// Render the demo when this file is executed directly
if (require.main === module) {
  renderApp(<App><UIDemo /></App>);
}

export default UIDemo;