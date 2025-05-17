import React, { useState, useCallback } from 'react';
import { Box, Text } from './';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useInput } from 'ink';
import { TemplateDefinition, TemplateField, applyTemplate } from '@core/template-definition';
import { TemplateFormSelectItem } from './TemplateFormSelect';

interface TemplateFormProps {
  /** Template definition to use for the form */
  template: TemplateDefinition;
  /** Current field values */
  values: Record<string, string>;
  /** Callback when values change */
  onChange: (values: Record<string, string>) => void;
  /** Callback when form is submitted */
  onSubmit: (values: Record<string, string>) => void;
}

/**
 * Remove the unused SelectOption interface since we're using the TemplateFormSelectItem
 * component which has its own properly defined props.
 */

/**
 * Component for filling out a template form with dynamic fields
 */
const TemplateForm: React.FC<TemplateFormProps> = ({ template, values, onChange, onSubmit }) => {
  // Track which field is currently focused
  const [focusedField, setFocusedField] = useState<string>(
    template.fields.length > 0 ? template.fields[0].name : '',
  );

  // Generate a preview of the commit message
  let preview = '';
  try {
    preview = applyTemplate(template, values);
  } catch (error) {
    preview = 'Preview not available (missing required fields)';
  }

  // Handle keyboard navigation
  useInput((_input, key) => {
    if (key.escape) {
      // Submit the form when Escape is pressed
      onSubmit(values);
    } else if (key.tab || (key.return && !key.shift)) {
      // Find the next field to focus when Tab or Enter is pressed
      const currentIndex = template.fields.findIndex((f) => f.name === focusedField);
      if (currentIndex >= 0 && currentIndex < template.fields.length - 1) {
        // Move to the next field
        setFocusedField(template.fields[currentIndex + 1].name);
      } else if (currentIndex === template.fields.length - 1) {
        // If we're at the last field, cycle back to the first field
        setFocusedField(template.fields[0].name);
      }
    }
  });

  // Handle value changes
  const handleValueChange = useCallback(
    (field: TemplateField, value: string) => {
      onChange({
        ...values,
        [field.name]: value,
      });
    },
    [values, onChange],
  );

  // Handle field submission (e.g., Enter key)
  const handleFieldSubmit = useCallback(
    (field: TemplateField) => {
      // Find the next field to focus
      const currentIndex = template.fields.findIndex((f) => f.name === field.name);
      if (currentIndex === template.fields.length - 1) {
        // If this is the last field, submit the form
        onSubmit(values);
      } else {
        // Otherwise move to the next field
        setFocusedField(template.fields[currentIndex + 1].name);
      }
    },
    [template.fields, onSubmit, values],
  );

  // Render a field based on its type
  const renderField = (field: TemplateField) => {
    const isFocused = focusedField === field.name;
    const value = values[field.name] || '';

    return (
      <Box key={field.name} flexDirection="column" marginBottom={1}>
        <Box>
          <Text bold>{field.label}</Text>
          {field.required && <Text color="red"> *</Text>}
          {field.hint && <Text dimColor> ({field.hint})</Text>}
        </Box>

        <Box marginLeft={2}>
          {isFocused ? (
            field.type === 'select' ? (
              <SelectInput
                items={(field.options || []).map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                initialIndex={(field.options || []).findIndex((option) => option.value === value)}
                onSelect={(item) => {
                  handleValueChange(field, item.value);
                  handleFieldSubmit(field);
                }}
                itemComponent={TemplateFormSelectItem as any}
              />
            ) : field.type === 'multiline' ? (
              <TextInput
                value={value}
                onChange={(v) => handleValueChange(field, v)}
                onSubmit={() => handleFieldSubmit(field)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            ) : (
              <TextInput
                value={value}
                onChange={(v) => handleValueChange(field, v)}
                onSubmit={() => handleFieldSubmit(field)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            )
          ) : (
            <Text>{value || <Text dimColor>(not set)</Text>}</Text>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text bold>Template: </Text>
        <Text>{template.name}</Text>
      </Box>

      {template.fields.map(renderField)}

      <Box flexDirection="column" marginTop={1} borderStyle="round" paddingX={1}>
        <Text bold>Preview:</Text>
        <Text>{preview}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Tab: Switch fields | Enter: Next field | Esc: Submit</Text>
      </Box>
    </Box>
  );
};

export default TemplateForm;
