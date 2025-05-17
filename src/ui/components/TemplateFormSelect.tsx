import React from 'react';
import { Box, Text } from './';

/**
 * Props for the TemplateFormSelectItem component
 */
export interface SelectOptionProps {
  isSelected: boolean;
  item: {
    label: string;
    value: string;
  };
}

/**
 * Item component for select input in forms
 */
export const TemplateFormSelectItem: React.FC<SelectOptionProps> = ({ isSelected, item }) => (
  <Box>
    <Text color={isSelected ? 'blue' : undefined} bold={isSelected}>
      {item.label}
    </Text>
  </Box>
);
