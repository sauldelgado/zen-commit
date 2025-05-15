import React, { useState } from 'react';
// We're not importing from ink directly as it's not how components are structured in this project
// In a real app, this would be handled differently
import { Box, Text } from '../ui/components';
import { CommitMessageInput } from '../ui/components';

/**
 * Demo component for CommitMessageInput
 */
const CommitMessageDemo = () => {
  const [message, setMessage] = useState('');
  const [showSubjectBody, setShowSubjectBody] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (value: string) => {
    setSubmitted(true);
    console.log('Submitted commit message:', value);
  };

  // In a real app, we would use useInput to toggle modes based on key presses

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Commit Message Input Demo</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>Press T to toggle between simple and detailed input mode</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Current mode: {showSubjectBody ? 'Detailed' : 'Simple'}</Text>
      </Box>

      {!submitted ? (
        <CommitMessageInput
          value={message}
          onChange={setMessage}
          showSubjectBodySeparation={showSubjectBody}
          onSubmit={handleSubmit}
        />
      ) : (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>Submitted Message:</Text>
          <Box marginY={1} paddingX={1} borderStyle="round">
            <Text>{message || <Text dimColor>Empty message</Text>}</Text>
          </Box>
          <Text dimColor>Press Ctrl+C to exit</Text>
        </Box>
      )}
    </Box>
  );
};

// In this project, we don't have direct render functionality

export default CommitMessageDemo;
