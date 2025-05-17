import React, { Component } from 'react';
import { Box, Text } from './';
import { TemplateDefinition } from '@core/template-definition';

interface SelectItemProps {
  isSelected: boolean;
  item: {
    label: string;
    value: TemplateDefinition;
    description?: string;
  };
}

/**
 * Item component for select input
 */
export class TemplateSelectItem extends Component<SelectItemProps> {
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
