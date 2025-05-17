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

/**
 * Props for the ConventionalCommitForm component
 *
 * @property value - The current commit message value
 * @property onChange - Callback function invoked when the commit message changes
 * @property onSubmit - Optional callback function invoked when the form is submitted
 */
export interface ConventionalCommitFormProps {
  /** The current commit message value */
  value: string;
  /** Callback function invoked when the commit message changes */
  onChange: (value: string) => void;
  /** Optional callback function invoked when the form is submitted */
  onSubmit?: () => void;
}

/**
 * Represents the various fields that can be focused in the form
 */
type FocusableField = 'type' | 'scope' | 'breaking' | 'description' | 'body' | 'footer' | 'none';

/**
 * Form component for creating commits following the Conventional Commits specification
 *
 * This component provides a structured interface for creating conventional commit messages
 * with proper format validation according to the specification. It includes:
 *
 * - Type selection from predefined conventional commit types
 * - Optional scope specification
 * - Breaking change indication
 * - Description input
 * - Optional body for detailed explanation
 * - Optional footer for metadata and breaking change notes
 * - Real-time validation and preview
 */
const ConventionalCommitForm: React.FC<ConventionalCommitFormProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  /**
   * Initialize the commit state from the provided value or with defaults
   * for a new conventional commit
   */
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

  /**
   * State for the current commit being edited
   */
  const [commit, setCommit] = useState<ConventionalCommit>(initialCommit);

  /**
   * State tracking which field is currently focused for editing
   */
  const [focusedField, setFocusedField] = useState<FocusableField>('type');

  /**
   * Effect to format and propagate changes to the parent component
   * whenever the commit object changes
   */
  useEffect(() => {
    const formatted = formatConventionalCommit(commit);
    onChange(formatted);
  }, [commit, onChange]);

  /**
   * Validation results for the current commit
   */
  const validation = validateConventionalCommit(commit);

  /**
   * Updates a field in the commit object
   *
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const updateCommit = (field: keyof ConventionalCommit, value: string | boolean) => {
    setCommit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Options for the type selector based on valid conventional commit types
   */
  const typeOptions = VALID_COMMIT_TYPES.map((type) => ({
    label: type,
    value: type,
  }));

  /**
   * Determines the next field to focus based on the current field
   *
   * @param current - The currently focused field
   * @returns The next field to focus, or 'none' if at the end
   */
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

  /**
   * Handles field submission and navigation between fields
   *
   * @param field - The field that was submitted
   */
  const handleFieldSubmit = (field: FocusableField) => {
    const next = nextField(field);

    if (next === 'none' && onSubmit) {
      // If we've reached the end of the form and have an onSubmit handler, call it
      onSubmit();
    } else {
      setFocusedField(next);
    }
  };

  /**
   * Toggles the breaking change flag and moves to the next field
   */
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
