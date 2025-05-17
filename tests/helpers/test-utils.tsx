import React from 'react';
import { render as inkRender } from 'ink-testing-library';

/**
 * Enhanced render function for testing Ink components
 * @param ui The React element to render
 * @returns The render result with additional utilities
 */
export async function renderWithAct(ui: React.ReactElement) {
  // Simple render without act() since we don't need it for these tests
  const result = inkRender(ui);

  // Wait for effects to resolve
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    ...result,
    findText: (text: string) => {
      const frame = result.lastFrame();
      return frame?.includes(text) || false;
    },
    findByTestId: (_testId: string) => {
      // This is a mock implementation since we can't actually find DOM elements
      return {
        click: () => {},
      };
    },
    waitForText: async (text: string, timeout = 1000) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        if (result.lastFrame()?.includes(text)) {
          return true;
        }
        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return false;
    },
  };
}

/**
 * Key object type used in useInput hook
 */
export interface InputKey {
  return?: boolean;
  escape?: boolean;
  tab?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
}

/**
 * Type for useInput callback
 */
export type UseInputCallback = (input: string, key: InputKey) => void;

/**
 * Simulate keyboard input with proper typing
 * @param callback The input callback to simulate input for
 * @param input The input string
 * @param key The key object
 */
export function simulateInput(
  callback: UseInputCallback | null,
  input: string,
  key: InputKey = {},
) {
  if (callback) {
    callback(input, key);
  }
}

/**
 * Factory function to create mock components with proper typing
 * @param displayName The display name for the component
 * @param implementation Optional implementation of the component
 * @returns The mock component
 */
export function createMockComponent<P>(displayName: string, implementation?: React.FC<P>) {
  const defaultImpl: React.FC<P & { children?: React.ReactNode }> = ({ children }) => (
    <>{children}</>
  );
  const MockComponent = implementation || defaultImpl;
  MockComponent.displayName = displayName;
  return MockComponent;
}

/**
 * Registry for mock components and functions
 */
export const mocks = {
  registered: new Map<string, any>(),
  register<T>(name: string, implementation: T): T {
    this.registered.set(name, implementation);
    return implementation;
  },
  get<T>(name: string): T | undefined {
    return this.registered.get(name);
  },
  clear() {
    this.registered.clear();
  },
};

/**
 * Global state for useInput hook callback
 */
let globalInputCallback: UseInputCallback | null = null;

/**
 * Get the current input handler for testing keyboard events
 * @returns Object with methods to simulate keyboard input
 */
export function getInputHandler() {
  return {
    simulateInput: (input: string, key: InputKey = {}) => {
      if (globalInputCallback) {
        globalInputCallback(input, key);
      }
    },
    simulateKeypress: (key: InputKey) => {
      if (globalInputCallback) {
        globalInputCallback('', key);
      }
    },
    setCallback: (callback: UseInputCallback) => {
      globalInputCallback = callback;
    },
    getCallback: () => globalInputCallback,
  };
}
