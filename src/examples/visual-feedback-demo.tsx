import React, { useState } from 'react';
import { Box, Text, CommitMessageInput } from '../ui/components';
import App, { renderApp } from '../ui/App';

const VisualFeedbackDemo = () => {
  const [message, setMessage] = useState('');
  // For simplicity in the demo, we'll set these to true
  const conventionalCommit = true;
  const feedbackExpanded = true;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Zen Commit - Visual Feedback Demo</Text>

      <Box marginY={1} flexDirection="column">
        <Box>
          <Text>Conventional Format: </Text>
          <Text color="green">Enabled</Text>
        </Box>

        <Box>
          <Text>Expanded Feedback: </Text>
          <Text color="green">Enabled</Text>
        </Box>
      </Box>

      <CommitMessageInput
        value={message}
        onChange={setMessage}
        placeholder="Enter commit message..."
        conventionalCommit={conventionalCommit}
        showSuggestions={true}
        showFeedback={true}
        feedbackExpanded={feedbackExpanded}
      />

      <Box marginTop={2}>
        <Text>Try different message formats:</Text>
      </Box>
      <Box flexDirection="column" marginLeft={2}>
        <Text>- Short message: "Fix bug"</Text>
        <Text>- Standard message: "Fix login issue when using special characters"</Text>
        <Text>
          - Long subject: "This is a very long subject line that exceeds the recommended length for
          good commit messages"
        </Text>
        <Text>- With body: "Update README\n\nAdd installation instructions and examples"</Text>
        <Text>- Conventional: "feat(auth): add password reset functionality"</Text>
      </Box>
    </Box>
  );
};

// Render the demo when this file is executed directly
if (require.main === module) {
  renderApp(
    <App>
      <VisualFeedbackDemo />
    </App>,
  );
}

export default VisualFeedbackDemo;
