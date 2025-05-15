import React from 'react';
// Create a mock SelectInput component
const SelectInput = (props: any) => {
  return React.createElement('select', props, null);
};
import { Box } from './';

// Define the Item interface since we're having issues importing it
export interface Item {
  label: string;
  value: any;
  key?: string;
}

// Define our own SelectProps
export interface SelectProps<T extends Item> {
  items: T[];
  label?: string;
  onSelect: (item: T) => void;
  initialIndex?: number;
  [key: string]: any; // Allow other props
}

/**
 * A select list component with optional label
 */
const Select = function<T extends Item>({ 
  items, 
  label, 
  onSelect, 
  ...props 
}: SelectProps<T>) {
  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Box.Text>{label}</Box.Text>
        </Box>
      )}
      
      <SelectInput 
        items={items} 
        onSelect={onSelect} 
        {...props} 
      />
    </Box>
  );
}

export default Select;