import React from 'react';
// We'll need to keep the mock TextInput for now
const TextInput = (props: any) => {
  return React.createElement('input', props, null);
};
import { Box } from './';

export interface InputProps {
  value: string;
  label?: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  [key: string]: any; // Allow additional props
}

/**
 * A text input component with optional label and error message
 */
const Input: React.FC<InputProps> = ({ label, error, onChange, ...props }) => {
  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Box.Text>{label}</Box.Text>
        </Box>
      )}

      <TextInput onChange={onChange} {...props} />

      {error && (
        <Box marginTop={1}>
          <Box.Text color="red">{error}</Box.Text>
        </Box>
      )}
    </Box>
  );
};

export default Input;
