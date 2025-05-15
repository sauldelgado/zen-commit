#!/usr/bin/env node
// Message validation demo with the direct import approach that works

// Using dynamic imports with Promise.all to avoid ESM/CommonJS issues
const reactPromise = import('react');
const inkPromise = import('ink');
const inkTextInputPromise = import('ink-text-input');

// Use Promise.all to wait for all imports
Promise.all([reactPromise, inkPromise, inkTextInputPromise])
  .then(([reactModule, inkModule, inkTextInputModule]) => {
    // Extract what we need from the modules
    const React = reactModule.default;
    const { useState } = reactModule;
    const { render, Box, Text } = inkModule;
    const TextInput = inkTextInputModule.default;

    // Demo component using our UI components
    const MessageValidationDemo = () => {
      // Define state with useState
      const [message, setMessage] = useState('');

      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          React.createElement(
            Text,
            { bold: true, key: 'title' },
            'Zen Commit - Message Validation Demo',
          ),
          React.createElement(Box, { marginY: 1, flexDirection: 'column', key: 'status' }, [
            React.createElement(Box, { key: 'conventional' }, [
              React.createElement(Text, { key: 'label1' }, 'Conventional Format: '),
              React.createElement(Text, { color: 'red', key: 'value1' }, 'Disabled'),
            ]),
            React.createElement(Box, { key: 'suggestions' }, [
              React.createElement(Text, { key: 'label2' }, 'Suggestions: '),
              React.createElement(Text, { color: 'green', key: 'value2' }, 'Enabled'),
            ]),
          ]),
          React.createElement(
            Box,
            { key: 'input', marginY: 1 },
            React.createElement(Text, {}, `Current message: ${message || '(empty)'}`),
          ),
          React.createElement(
            Box,
            { marginTop: 2, key: 'header' },
            React.createElement(Text, { key: 'headerText' }, 'Try different message formats:'),
          ),
          React.createElement(Box, { flexDirection: 'column', marginLeft: 2, key: 'examples' }, [
            React.createElement(Text, { key: 'ex1' }, '- Short message: "Fix bug"'),
            React.createElement(
              Text,
              { key: 'ex2' },
              '- Standard message: "Fix login issue when using special characters"',
            ),
            React.createElement(
              Text,
              { key: 'ex3' },
              '- With body: "Update README\\n\\nAdd installation instructions and examples"',
            ),
            React.createElement(
              Text,
              { key: 'ex4' },
              '- Conventional: "feat(auth): add password reset functionality"',
            ),
          ]),
          React.createElement(
            Box,
            { marginTop: 1, key: 'hint' },
            React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
          ),
        ],
      );
    };

    // Render the App
    console.log('Rendering Message Validation Demo...');
    const { waitUntilExit } = render(React.createElement(MessageValidationDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
