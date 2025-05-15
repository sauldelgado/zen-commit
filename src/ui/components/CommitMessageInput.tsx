import React, { useState } from 'react';
// Create a mock TextInput component
const TextInput = (props: any) => {
  return React.createElement('input', props, null);
};
import { Box, Text } from './';

export interface CommitMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSubjectBodySeparation?: boolean;
  subjectLimit?: number;
  onSubmit?: (value: string) => void;
}

/**
 * Component for entering a commit message with optional subject/body separation
 */
const CommitMessageInput: React.FC<CommitMessageInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter a commit message...',
  showSubjectBodySeparation = false,
  subjectLimit = 50,
  onSubmit,
}) => {
  const [focusedField, setFocusedField] = useState<'subject' | 'body'>('subject');

  const lines = value.split('\n');
  const subject = lines[0] || '';
  const body = lines.slice(1).join('\n');
  const isSubjectTooLong = subject.length > subjectLimit;

  const handleSubjectChange = (newSubject: string) => {
    const newValue = [newSubject, ...lines.slice(1)].join('\n');
    onChange(newValue);
  };

  const handleBodyChange = (newBody: string) => {
    const newValue = [subject, newBody].join('\n');
    onChange(newValue);
  };

  const handleSubjectSubmit = () => {
    setFocusedField('body');
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
  };

  // For keyboard navigation, we would use useInput from ink
  // but we're adapting our implementation to match the project structure
  // Navigation will be handled by the parent component

  if (!showSubjectBodySeparation) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Box marginBottom={1}>
          <Text bold>Commit message:</Text>
        </Box>
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onSubmit={handleSubmit}
        />
        <Box marginTop={1}>
          <Text dimColor>Press Enter to submit, Esc to cancel</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text bold>Subject:</Text>
        {isSubjectTooLong && (
          <Text color="yellow">
            {' '}
            (Subject line too long: {subject.length}/{subjectLimit})
          </Text>
        )}
      </Box>

      {focusedField === 'subject' ? (
        <TextInput
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Brief summary of changes"
          onSubmit={handleSubjectSubmit}
        />
      ) : (
        <Box>
          <Text>{subject || <Text dimColor>No subject</Text>}</Text>
        </Box>
      )}

      <Box marginY={1}>
        <Text bold>Body:</Text>
        <Text dimColor> (Optional - Provide more detailed explanation)</Text>
      </Box>

      {focusedField === 'body' ? (
        <TextInput
          value={body}
          onChange={handleBodyChange}
          placeholder="Detailed explanation"
          onSubmit={handleSubmit}
        />
      ) : (
        <Box>
          <Text>{body || <Text dimColor>No body</Text>}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Tab: Switch fields | Enter: Submit | Esc: Cancel</Text>
      </Box>
    </Box>
  );
};

export default CommitMessageInput;
