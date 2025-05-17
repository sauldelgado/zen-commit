import React from 'react';
import { createMockComponent, mocks, InputKey, UseInputCallback } from './test-utils';

/**
 * Ink Mock Registry
 *
 * This file contains properly typed mock implementations of Ink components and hooks
 * for use in testing. The mocks provide consistent implementations that can be
 * reused across test files, eliminating the need to redefine mocks in each test.
 *
 * Usage:
 * 1. Import the setupInkMocks function in your test file's setup
 * 2. Call setupInkMocks() before your tests
 * 3. Use the mock implementations in your tests
 *
 * Example:
 * ```typescript
 * import { setupInkMocks } from '../helpers/ink-mock-registry';
 *
 * beforeEach(() => {
 *   setupInkMocks();
 * });
 *
 * it('should render a component with Ink components', async () => {
 *   const { lastFrame } = await renderWithAct(<MyComponent />);
 *   expect(lastFrame()).toContain('Expected text');
 * });
 * ```
 */

/**
 * Interface for SelectInput props
 * Provides proper typing for the SelectInput component
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
 *
 * This function must be called in beforeAll, not beforeEach because jest.mock must be called
 * at the top level of the module, not inside any function. Otherwise, we need to use dynamic imports
 * with jest.doMock() instead.
 */
export function setupInkMocks() {
  return {}; // This is a placeholder function to satisfy imports
  // The actual mocking should be done at the module level using jest.mock directly
}
