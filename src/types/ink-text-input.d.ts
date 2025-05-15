declare module 'ink-text-input' {
  import * as React from 'react';

  export interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    focus?: boolean;
    mask?: string;
    highlightPastedText?: boolean;
    showCursor?: boolean;
    onSubmit?: (value: string) => void;
  }

  const TextInput: React.FC<TextInputProps>;
  export default TextInput;
}
