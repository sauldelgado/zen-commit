import React from 'react';
import { createMockComponent, mocks, InputKey, UseInputCallback } from './test-utils';

/**
 * Interface for SelectInput props
 */
export interface SelectInputProps<T> {
  items: Array<{ label: string; value: T; [key: string]: any }>;
  onSelect: (item: { value: T; [key: string]: any }) => void;
  itemComponent?: React.ComponentType<{ isSelected: boolean; item: any }>;
  initialIndex?: number;
}

/**
 * Mock implementation of SelectInput component that supports both class and function components
 */
export const MockSelectInput = createMockComponent<SelectInputProps<any>>(
  'SelectInput',
  (props) => {
    const { items, onSelect, itemComponent: ItemComponent, initialIndex = 0 } = props;

    return (
      <div data-testid="select-input">
        {items.map((item, i) => (
          <div key={i} onClick={() => onSelect(item)} data-testid={`select-item-${i}`}>
            {ItemComponent ? (
              <ItemComponent isSelected={i === initialIndex} item={item} />
            ) : (
              <div>{item.label}</div>
            )}
          </div>
        ))}
        <div data-testid="select-help">Use arrow keys to navigate, Enter to select</div>
      </div>
    );
  },
);

/**
 * Interface for TextInput props
 */
export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  focus?: boolean;
}

/**
 * Mock implementation of TextInput component
 */
export const MockTextInput = createMockComponent<TextInputProps>('TextInput', (props) => {
  const { value, onChange, onSubmit, placeholder, focus } = props;

  return (
    <div data-testid="text-input">
      <input
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onKeyDown={(e: any) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        autoFocus={focus}
        data-testid="text-input-field"
      />
      {placeholder && <div data-testid="placeholder">{placeholder}</div>}
    </div>
  );
});

/**
 * Interface for Box props
 */
export interface BoxProps {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginX?: number;
  marginY?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingX?: number;
  paddingY?: number;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Mock implementation of Box component
 */
export const MockBox = createMockComponent<BoxProps>('Box', ({ children, ...props }) => {
  const testId = props['data-testid'] || 'box';
  return <div data-testid={testId}>{children}</div>;
});

/**
 * Interface for Text props
 */
export interface TextProps {
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dimColor?: boolean;
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Mock implementation of Text component
 */
export const MockText = createMockComponent<TextProps>('Text', ({ children, ...props }) => {
  const testId = props['data-testid'] || 'text';
  return <span data-testid={testId}>{children}</span>;
});

/**
 * useInput hook mock
 * @param callback Callback function called on input
 * @returns Object with input simulation helpers
 */
export function mockUseInput(callback: UseInputCallback) {
  // Store the callback for tests to trigger
  const setGlobalInputHandler = require('./test-utils').getInputHandler().setCallback;
  setGlobalInputHandler(callback);

  return {
    simulateInput: (input: string, key: InputKey = {}) => {
      if (callback) {
        callback(input, key);
      }
    },
  };
}

/**
 * useApp hook mock
 * @returns Object with app-related methods
 */
export function mockUseApp() {
  return {
    exit: jest.fn(),
  };
}

// Register the mocks
mocks.register('SelectInput', MockSelectInput);
mocks.register('TextInput', MockTextInput);
mocks.register('Box', MockBox);
mocks.register('Text', MockText);
mocks.register('useInput', mockUseInput);
mocks.register('useApp', mockUseApp);

/**
 * Setup function to initialize all mocks in a test
 */
export function setupInkMocks() {
  jest.mock('ink-select-input', () => mocks.get('SelectInput'));
  jest.mock('ink-text-input', () => mocks.get('TextInput'));
  jest.mock('ink', () => ({
    Box: mocks.get('Box'),
    Text: mocks.get('Text'),
    useInput: mocks.get('useInput'),
    useApp: mocks.get('useApp'),
  }));
}
