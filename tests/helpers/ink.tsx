import React from 'react';
import { render as inkRender } from 'ink-testing-library';

/**
 * Render helper for testing Ink components
 */
export function render(ui: React.ReactElement) {
  const result = inkRender(ui);

  return {
    ...result,
    rerender: (newUi: React.ReactElement) => result.rerender(newUi),
    unmount: () => result.unmount(),
  };
}

/**
 * Simulate keyboard input for testing
 */
export function simulateInput(stdin: any, input: string) {
  if (stdin && stdin.write) {
    stdin.write(input);
  }
}
