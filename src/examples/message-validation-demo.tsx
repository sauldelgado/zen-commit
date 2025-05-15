import React, { useState } from 'react';
import { Box, Text, CommitMessageInput } from '../ui/components';
import { render } from 'ink';

const MessageValidationDemo = () => {
  const [message, setMessage] = useState('');
  const [conventionalCommit] = useState(false);
  const [showSuggestions] = useState(true);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Zen Commit - Message Validation Demo</Text>

      <Box marginY={1} flexDirection="column">
        <Box>
          <Text>Conventional Format: </Text>
          <Text color={conventionalCommit ? 'green' : 'red'}>
            {conventionalCommit ? 'Enabled' : 'Disabled'}
          </Text>
        </Box>

        <Box>
          <Text>Suggestions: </Text>
          <Text color={showSuggestions ? 'green' : 'red'}>
            {showSuggestions ? 'Enabled' : 'Disabled'}
          </Text>
        </Box>
      </Box>

      <CommitMessageInput
        value={message}
        onChange={setMessage}
        placeholder="Enter commit message..."
        conventionalCommit={conventionalCommit}
        showSuggestions={showSuggestions}
      />

      <Box marginTop={2}>
        <Text>Try different message formats:</Text>
      </Box>
      <Box flexDirection="column" marginLeft={2}>
        <Text>- Short message: "Fix bug"</Text>
        <Text>- Standard message: "Fix login issue when using special characters"</Text>
        <Text>- With body: "Update README\n\nAdd installation instructions and examples"</Text>
        <Text>- Conventional: "feat(auth): add password reset functionality"</Text>
      </Box>
    </Box>
  );
};

// Render the demo when this file is executed directly
if (require.main === module) {
  render(<MessageValidationDemo />);
}

export default MessageValidationDemo;
