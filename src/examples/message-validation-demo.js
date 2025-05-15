#!/usr/bin/env node
// Message validation demo with JavaScript to avoid TypeScript issues

// Use dynamic import for ink to avoid ESM/CommonJS issues
(async () => {
  try {
    // Import the modules we need
    const inkModule = await import('ink');
    const reactModule = await import('react');
    const React = reactModule.default;
    const { useState } = React;
    const { render } = inkModule;

    // Import our components
    // We need to use require for our own components
    const components = require('../ui/components');
    const { Box, Text, CommitMessageInput } = components;
    const ThemeProvider = require('../ui/ThemeProvider').ThemeProvider;

    // Demo component using our UI components
    const MessageValidationDemo = () => {
      // Define state with useState
      const [message, setMessage] = React.useState('');
      const [conventionalCommit] = React.useState(false);
      const [showSuggestions] = React.useState(true);

      return React.createElement(
        ThemeProvider,
        {},
        React.createElement(
          Box,
          { flexDirection: 'column', padding: 1 },
          React.createElement(Text, { bold: true }, 'Zen Commit - Message Validation Demo'),
          React.createElement(
            Box,
            { marginY: 1, flexDirection: 'column' },
            React.createElement(
              Box,
              {},
              React.createElement(Text, {}, 'Conventional Format: '),
              React.createElement(
                Text,
                { color: conventionalCommit ? 'green' : 'red' },
                conventionalCommit ? 'Enabled' : 'Disabled',
              ),
            ),
            React.createElement(
              Box,
              {},
              React.createElement(Text, {}, 'Suggestions: '),
              React.createElement(
                Text,
                { color: showSuggestions ? 'green' : 'red' },
                showSuggestions ? 'Enabled' : 'Disabled',
              ),
            ),
          ),
          React.createElement(CommitMessageInput, {
            value: message,
            onChange: setMessage,
            placeholder: 'Enter commit message...',
            conventionalCommit: conventionalCommit,
            showSuggestions: showSuggestions,
          }),
          React.createElement(
            Box,
            { marginTop: 2 },
            React.createElement(Text, {}, 'Try different message formats:'),
          ),
          React.createElement(
            Box,
            { flexDirection: 'column', marginLeft: 2 },
            React.createElement(Text, {}, '- Short message: "Fix bug"'),
            React.createElement(
              Text,
              {},
              '- Standard message: "Fix login issue when using special characters"',
            ),
            React.createElement(
              Text,
              {},
              '- With body: "Update README\\n\\nAdd installation instructions and examples"',
            ),
            React.createElement(
              Text,
              {},
              '- Conventional: "feat(auth): add password reset functionality"',
            ),
          ),
        ),
      );
    };

    // Render the app
    const { waitUntilExit } = render(React.createElement(MessageValidationDemo));

    // Wait for user to exit
    waitUntilExit().then(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
