import React, { useState, useEffect } from 'react';
import { Box, Text } from './';
import { useInput } from 'ink';
import { TemplateDefinition } from '@core/template-definition';
import { TemplateManager } from '@core/template-manager';
import TemplateSelector from './TemplateSelector';
import TemplateForm from './TemplateForm';

interface TemplateBrowserProps {
  /** Whether templates are currently loading */
  loading?: boolean;
  /** Template manager instance */
  templateManager?: TemplateManager;
  /** Initial template name to select */
  initialTemplate?: string;
  /** Initial values for template fields */
  initialValues?: Record<string, string>;
  /** Callback when template is completed with a message */
  onTemplateComplete: (message: string) => void;
  /** Optional callback for cancellation */
  onCancel?: () => void;
}

/**
 * Component for browsing and filling out commit templates
 * Combines template selection and form filling in a cohesive interface
 */
const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  loading = false,
  templateManager,
  initialTemplate,
  initialValues = {},
  onTemplateComplete,
  onCancel,
}) => {
  // State for managing templates and UI flow
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(loading);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [showSelector, setShowSelector] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates on component mount
  useEffect(() => {
    if (!templateManager) return;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);

      try {
        const allTemplates = await templateManager.getAllTemplates();
        setTemplates(allTemplates);

        // Select initial template if specified
        if (initialTemplate) {
          const template = allTemplates.find((t) => t.name === initialTemplate);
          if (template) {
            setSelectedTemplate(template);
            setShowSelector(false);
          }
        } else if (allTemplates.length > 0) {
          setSelectedTemplate(allTemplates[0]);
        }
      } catch (err) {
        setError(`Failed to load templates: ${(err as Error).message}`);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [templateManager, initialTemplate]);

  // Keyboard navigation for going back to selector or canceling
  useInput((input, key) => {
    if ((input === 'b' || input === 'B') && !showSelector && selectedTemplate) {
      // Go back to template selection
      setShowSelector(true);
    } else if (key.escape && onCancel) {
      // Cancel template browser
      onCancel();
    }
  });

  // Handle template selection
  const handleTemplateSelect = (template: TemplateDefinition) => {
    setSelectedTemplate(template);

    // Initialize with default values if provided in the template
    const defaultValues: Record<string, string> = {};
    template.fields.forEach((field) => {
      if (field.default !== undefined) {
        defaultValues[field.name] = field.default;
      }
    });

    // Merge default values with any existing values
    setValues((prev) => ({
      ...defaultValues,
      ...prev,
    }));

    setShowSelector(false);
  };

  // Handle form value changes
  const handleFormChange = (newValues: Record<string, string>) => {
    setValues(newValues);
  };

  // Handle form submission
  const handleFormSubmit = (formValues: Record<string, string>) => {
    if (selectedTemplate) {
      try {
        // Apply template to get formatted message
        const formattedMessage = selectedTemplate.format;

        // Replace placeholders with values
        const message = formattedMessage.replace(
          /\{([a-zA-Z0-9_]+)\}/g,
          (_, field) => formValues[field] || '',
        );

        onTemplateComplete(message);
      } catch (error) {
        setError(`Failed to format message: ${(error as Error).message}`);
      }
    }
  };

  // If loading, show loading message
  if (isLoadingTemplates) {
    return (
      <Box>
        <Box marginLeft={1}>
          <Text>Loading templates</Text>
        </Box>
      </Box>
    );
  }

  // If error occurred, show error message
  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">{error}</Text>
        <Box marginTop={1}>
          <Text dimColor>Press any key to continue without a template.</Text>
        </Box>
      </Box>
    );
  }

  // If no templates found, show message
  if (templates.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>No templates found.</Text>
        <Box marginTop={1}>
          <Text dimColor>Press any key to continue without a template.</Text>
        </Box>
      </Box>
    );
  }

  // Show template selector or form based on current state
  return (
    <Box flexDirection="column">
      {showSelector ? (
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleTemplateSelect}
        />
      ) : selectedTemplate ? (
        <Box flexDirection="column">
          <TemplateForm
            template={selectedTemplate}
            values={values}
            onChange={handleFormChange}
            onSubmit={handleFormSubmit}
          />

          <Box marginTop={1}>
            <Text dimColor>Press B to go back to template selection, Esc to cancel</Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default TemplateBrowser;
