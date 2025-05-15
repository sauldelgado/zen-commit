// Using require() for ink directly
import('ink').then(({ render, Box, Text }) => {
  const React = require('react');

  // Create a very simple component with createElement API
  const Demo = () => {
    return React.createElement(
      Box,
      { flexDirection: 'column', borderStyle: 'round', padding: 1 },
      React.createElement(Text, { bold: true }, 'Ink Demo'),
      React.createElement(
        Box,
        { marginY: 1 },
        React.createElement(Text, {}, 'This should appear in the terminal'),
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

  // Render
  const { unmount } = render(React.createElement(Demo));

  // Auto-unmount after 5 seconds
  setTimeout(() => {
    unmount();
    process.exit(0);
  }, 5000);
});
