// Combined demo that uses our components with direct Ink rendering
import('ink')
  .then(({ render }) => {
    const React = require('react');
    // With JS files, we need to use relative paths carefully
    const components = require('../ui/components/index');
    const Box = components.Box;
    const Text = components.Text;
    const ThemeProvider = require('../ui/ThemeProvider').ThemeProvider;

    // Demo component using our UI components
    const Demo = () => {
      return React.createElement(
        ThemeProvider,
        {},
        React.createElement(
          Box,
          { flexDirection: 'column', padding: 1, borderStyle: 'round' },
          React.createElement(Text, { bold: true }, 'Zen Commit UI Demo'),
          React.createElement(
            Box,
            { marginY: 1 },
            React.createElement(Text, {}, 'Using our components with real Ink rendering'),
          ),
          React.createElement(
            Box,
            { flexDirection: 'column', marginY: 1 },
            React.createElement(Text, { color: 'green' }, 'Green Text'),
            React.createElement(Text, { color: 'yellow' }, 'Yellow Text'),
            React.createElement(Text, { color: 'red' }, 'Red Text'),
          ),
          React.createElement(
            Box,
            { marginTop: 1, borderStyle: 'single', padding: 1 },
            React.createElement(Text, {}, 'This box should have a border'),
          ),
          React.createElement(
            Box,
            { marginTop: 1 },
            React.createElement(Text, { dimColor: true }, 'Press Ctrl+C to exit'),
          ),
        ),
      );
    };

    // Direct rendering with Ink
    const { waitUntilExit } = render(React.createElement(Demo));

    // Wait for user to exit
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('Error loading Ink:', err);
  });
