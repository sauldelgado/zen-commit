import React, { useState, useEffect } from 'react';
import { Box, Text } from './';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import {
  parseConventionalCommit,
  formatConventionalCommit,
  validateConventionalCommit,
  VALID_COMMIT_TYPES,
  ConventionalCommitType,
  ConventionalCommit,
} from '@core/conventional-commits';

export interface ConventionalCommitFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

type FocusableField = 'type' | 'scope' | 'breaking' | 'description' | 'body' | 'footer' | 'none';

/**
 * Form component for creating commits following the Conventional Commits specification
 */
const ConventionalCommitForm: React.FC<ConventionalCommitFormProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  // Initialize state from the provided value
  const initialCommit = value
    ? parseConventionalCommit(value)
    : {
        type: 'feat' as ConventionalCommitType,
        scope: '',
        description: '',
        body: '',
        footer: '',
        isBreakingChange: false,
        isValid: true,
      };

  const [commit, setCommit] = useState<ConventionalCommit>(initialCommit);
  const [focusedField, setFocusedField] = useState<FocusableField>('type');

  // Format commit object to string whenever it changes
  useEffect(() => {
    const formatted = formatConventionalCommit(commit);
    onChange(formatted);
  }, [commit, onChange]);

  // Validate commit and show errors/warnings
  const validation = validateConventionalCommit(commit);

  // Update commit object when a field changes
  const updateCommit = (field: keyof ConventionalCommit, value: string | boolean) => {
    setCommit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Commit type selector options
  const typeOptions = VALID_COMMIT_TYPES.map((type) => ({
    label: type,
    value: type,
  }));

  // Handle field navigation
  const nextField = (current: FocusableField): FocusableField => {
    const fieldOrder: FocusableField[] = [
      'type',
      'scope',
      'breaking',
      'description',
      'body',
      'footer',
    ];
    const currentIndex = fieldOrder.indexOf(current);

    if (currentIndex === -1 || currentIndex === fieldOrder.length - 1) {
      return 'none'; // If we reach the end, we're done with the form
    }

    return fieldOrder[currentIndex + 1];
  };

  // Handle field submission (move to next field)
  const handleFieldSubmit = (field: FocusableField) => {
    const next = nextField(field);

    if (next === 'none' && onSubmit) {
      // If we've reached the end of the form and have an onSubmit handler, call it
      onSubmit();
    } else {
      setFocusedField(next);
    }
  };

  // Toggle breaking change
  const toggleBreakingChange = () => {
    updateCommit('isBreakingChange', !commit.isBreakingChange);
    handleFieldSubmit('breaking');
  };

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text bold>Conventional Commit Format</Text>
      </Box>

      {/* Type selector */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Type:</Text>
        </Box>
        {focusedField === 'type' ? (
          <SelectInput
            items={typeOptions}
            initialIndex={typeOptions.findIndex((item) => item.value === commit.type)}
            onSelect={(item: { value: string }) => {
              updateCommit('type', item.value);
              handleFieldSubmit('type');
            }}
          />
        ) : (
          <Text>{commit.type}</Text>
        )}
      </Box>

      {/* Scope input */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Scope:</Text>
        </Box>
        {focusedField === 'scope' ? (
          <TextInput
            value={commit.scope}
            onChange={(value: string) => updateCommit('scope', value)}
            placeholder="(optional)"
            onSubmit={() => handleFieldSubmit('scope')}
          />
        ) : (
          <Text>{commit.scope || <Text dimColor>(none)</Text>}</Text>
        )}
      </Box>

      {/* Breaking change toggle */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Breaking Change:</Text>
        </Box>
        {focusedField === 'breaking' ? (
          <Box>
            <Text>{commit.isBreakingChange ? 'Yes' : 'No'}</Text>
            <Text dimColor> (Press Enter to toggle, Space to continue)</Text>
            <TextInput value="" onChange={() => {}} onSubmit={toggleBreakingChange} />
          </Box>
        ) : (
          <Text>{commit.isBreakingChange ? 'Yes' : 'No'}</Text>
        )}
      </Box>

      {/* Description input */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Description:</Text>
        </Box>
        {focusedField === 'description' ? (
          <TextInput
            value={commit.description}
            onChange={(value: string) => updateCommit('description', value)}
            placeholder="Brief description of the change"
            onSubmit={() => handleFieldSubmit('description')}
          />
        ) : (
          <Text>{commit.description || <Text dimColor>(required)</Text>}</Text>
        )}
      </Box>

      {/* Body input */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Body:</Text>
        </Box>
        {focusedField === 'body' ? (
          <TextInput
            value={commit.body}
            onChange={(value: string) => updateCommit('body', value)}
            placeholder="(optional) Detailed explanation"
            onSubmit={() => handleFieldSubmit('body')}
          />
        ) : (
          <Text>{commit.body || <Text dimColor>(none)</Text>}</Text>
        )}
      </Box>

      {/* Footer input */}
      <Box marginBottom={1}>
        <Box width={15}>
          <Text>Footer:</Text>
        </Box>
        {focusedField === 'footer' ? (
          <TextInput
            value={commit.footer}
            onChange={(value: string) => updateCommit('footer', value)}
            placeholder="(optional) BREAKING CHANGE: description"
            onSubmit={() => handleFieldSubmit('footer')}
          />
        ) : (
          <Text>{commit.footer || <Text dimColor>(none)</Text>}</Text>
        )}
      </Box>

      {/* Validation messages */}
      {validation.errors.length > 0 && (
        <Box marginY={1} flexDirection="column">
          <Text color="red">Errors:</Text>
          {validation.errors.map((error, idx) => (
            <Box key={idx} marginLeft={2}>
              <Text color="red">• {error}</Text>
            </Box>
          ))}
        </Box>
      )}

      {validation.warnings.length > 0 && (
        <Box marginY={1} flexDirection="column">
          <Text color="yellow">Warnings:</Text>
          {validation.warnings.map((warning, idx) => (
            <Box key={idx} marginLeft={2}>
              <Text color="yellow">• {warning}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Preview of final message */}
      <Box marginTop={1} flexDirection="column">
        <Text bold>Preview:</Text>
        <Text>{formatConventionalCommit(commit)}</Text>
      </Box>

      {/* Navigation help */}
      <Box marginTop={1}>
        <Text dimColor>Tab: Switch fields | Enter: Next field | Esc: Finish</Text>
      </Box>
    </Box>
  );
};

export default ConventionalCommitForm;
