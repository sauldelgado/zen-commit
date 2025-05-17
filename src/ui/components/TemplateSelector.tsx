import React from 'react';
import { Box, Text } from './';
import SelectInput from 'ink-select-input';
import { Component } from 'react';
import { TemplateDefinition } from '@core/template-definition';

export interface TemplateSelectorProps {
  /** Array of available templates */
  templates: TemplateDefinition[];
  /** Currently selected template */
  selectedTemplate: TemplateDefinition | null;
  /** Callback when a template is selected */
  onSelectTemplate: (template: TemplateDefinition) => void;
}

// Define item type for SelectInput
type SelectItem = {
  label: string;
  value: TemplateDefinition;
  description?: string;
};

// Item component for template selection as a class component to satisfy type requirements
class TemplateSelectItem extends Component<{
  isSelected: boolean;
  item: SelectItem;
}> {
  render() {
    const { isSelected, item } = this.props;
    return (
      <Box>
        <Text color={isSelected ? 'blue' : undefined} bold={isSelected}>
          {item.label}
        </Text>
        {item.description && (
          <Text color={isSelected ? 'blue' : 'gray'} dimColor={!isSelected}>
            {' '}
            - {item.description}
          </Text>
        )}
      </Box>
    );
  }
}

/**
 * Component for selecting a commit message template
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  // Convert templates to items for SelectInput
  const items = templates.map((template) => ({
    label: template.name,
    value: template,
    description: template.description,
  }));

  const handleSelect = (item: SelectItem) => {
    onSelectTemplate(item.value);
  };

  // Handle case when no templates are available
  if (templates.length === 0) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Text color="yellow">No templates available.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text bold>Select a template:</Text>
      </Box>

      <SelectInput
        items={items}
        initialIndex={templates.findIndex(
          (t) => selectedTemplate && t.name === selectedTemplate.name,
        )}
        onSelect={handleSelect}
        itemComponent={TemplateSelectItem as any}
      />

      <Box marginTop={1}>
        <Text dimColor>Use arrow keys to navigate, Enter to select</Text>
      </Box>
    </Box>
  );
};

export default TemplateSelector;
