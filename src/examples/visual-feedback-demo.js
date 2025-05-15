#!/usr/bin/env node
// Visual feedback demo with the direct import approach that works

// Using dynamic imports with Promise.all to avoid ESM/CommonJS issues
const reactPromise = import('react');
const inkPromise = import('ink');

// Use Promise.all to wait for all imports
Promise.all([reactPromise, inkPromise])
  .then(([reactModule, inkModule]) => {
    // Extract what we need from the modules
    const React = reactModule.default;
    const { useState } = reactModule;
    const { render, Box, Text } = inkModule;

    // Mock components for visual feedback
    const MessageFeedback = ({ message }) => {
      // Calculate feedback based on message
      const length = message?.length || 0;
      const hasSubject = length > 0;
      const hasBody = message?.includes('\n\n') || false;
      const isConventional =
        message?.match(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(\w+\))?: .+/) || false;

      // Validation rules
      const isSubjectValid = length > 0 && length <= 50;
      const isBodyValid = !hasBody || message.split('\n\n')[1].length > 0;
      const isOverallValid = isSubjectValid && isBodyValid;

      // Feedback messages
      const feedbackItems = [];

      // Add feedback items based on message state
      if (length === 0) {
        feedbackItems.push({
          text: 'Enter a subject line for your commit',
          status: 'pending',
        });
      } else {
        // Subject feedback
        if (length <= 50) {
          feedbackItems.push({
            text: 'Subject line has good length',
            status: 'success',
          });
        } else {
          feedbackItems.push({
            text: `Subject line is too long (${length}/50)`,
            status: 'error',
          });
        }

        // Conventional commit format
        if (isConventional) {
          feedbackItems.push({
            text: 'Follows conventional commit format',
            status: 'success',
          });
        } else {
          feedbackItems.push({
            text: 'Consider using conventional commit format (type(scope): message)',
            status: 'warning',
          });
        }

        // Body feedback
        if (hasBody) {
          feedbackItems.push({
            text: 'Commit includes a body with additional details',
            status: 'success',
          });
        } else {
          feedbackItems.push({
            text: 'Consider adding a detailed body (separated by blank line)',
            status: 'info',
          });
        }
      }

      return React.createElement(
        Box,
        { flexDirection: 'column', marginY: 1, borderStyle: 'single', paddingX: 1 },
        [
          React.createElement(Text, { bold: true, key: 'feedback-title' }, 'Message Feedback'),
          ...feedbackItems.map((item, index) => {
            let color = 'white';
            let prefix = '';

            if (item.status === 'success') {
              color = 'green';
              prefix = '✓ ';
            } else if (item.status === 'error') {
              color = 'red';
              prefix = '✗ ';
            } else if (item.status === 'warning') {
              color = 'yellow';
              prefix = '! ';
            } else if (item.status === 'info') {
              color = 'blue';
              prefix = 'ℹ ';
            } else if (item.status === 'pending') {
              color = 'gray';
              prefix = '○ ';
            }

            return React.createElement(
              Text,
              { color, key: `feedback-${index}` },
              `${prefix}${item.text}`,
            );
          }),
          React.createElement(
            Text,
            {
              color: isOverallValid ? 'green' : 'red',
              bold: true,
              key: 'summary',
            },
            `Overall: ${isOverallValid ? 'Valid commit message' : 'Message needs improvement'}`,
          ),
        ],
      );
    };

    // Demo component
    const VisualFeedbackDemo = () => {
      // State for message input
      const [message, setMessage] = useState('');

      // Sample message to demonstrate feedback
      const [sampleIndex, setSampleIndex] = useState(0);

      // Sample messages
      const sampleMessages = [
        '',
        'Fix bug',
        'Fix login issue when using special characters',
        'This is a very long subject line that exceeds the recommended length for good commit messages',
        'Update README\n\nAdd installation instructions and examples',
        'feat(auth): add password reset functionality',
      ];

      // Function to cycle through sample messages
      const cycleSampleMessage = () => {
        const nextIndex = (sampleIndex + 1) % sampleMessages.length;
        setSampleIndex(nextIndex);
        setMessage(sampleMessages[nextIndex]);
      };

      return React.createElement(
        Box,
        { flexDirection: 'column', padding: 1, borderStyle: 'round' },
        [
          React.createElement(
            Text,
            { bold: true, key: 'title' },
            'Zen Commit - Visual Feedback Demo',
          ),

          React.createElement(
            Box,
            { marginY: 1, key: 'message-box' },
            React.createElement(Text, { bold: true }, 'Current Message:'),
          ),

          React.createElement(
            Box,
            {
              borderStyle: 'single',
              paddingX: 1,
              paddingY: 1,
              key: 'message-content',
            },
            message
              ? React.createElement(Text, {}, message.replace(/\n/g, '\\n'))
              : React.createElement(Text, { dimColor: true }, '(empty)'),
          ),

          // Message feedback component
          React.createElement(MessageFeedback, { message, key: 'feedback' }),

          React.createElement(
            Box,
            { marginY: 1, key: 'instructions' },
            React.createElement(
              Text,
              { italic: true },
              "Press 'n' to cycle through sample messages (simulated in this demo)",
            ),
          ),

          React.createElement(Box, { flexDirection: 'column', marginTop: 1, key: 'samples' }, [
            React.createElement(Text, { bold: true, key: 'samples-title' }, 'Sample Messages:'),
            ...sampleMessages.map((sample, index) =>
              React.createElement(
                Text,
                {
                  key: `sample-${index}`,
                  color: index === sampleIndex ? 'cyan' : 'white',
                  backgroundColor: index === sampleIndex ? 'blue' : undefined,
                },
                `${index + 1}. ${sample ? sample.replace(/\n/g, '\\n') : '(empty)'}`,
              ),
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

    // Render the app
    console.log('Rendering Visual Feedback Demo...');
    const { waitUntilExit } = render(React.createElement(VisualFeedbackDemo));

    // Wait until the user exits the app
    waitUntilExit().then(() => {
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
