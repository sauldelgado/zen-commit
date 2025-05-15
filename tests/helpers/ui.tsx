import React from 'react';
import { render as inkRender } from 'ink-testing-library';

/**
 * Enhanced render function for testing Ink components
 * @param element The component to render
 * @returns The render result with additional helpers
 */
export const render = (element: React.ReactElement) => {
  const renderResult = inkRender(element);

  return {
    ...renderResult,
    // Add custom helpers here
    findText: (text: string) => {
      const frame = renderResult.lastFrame();
      return frame?.includes(text) || false;
    },
    waitForText: async (text: string, timeout = 1000) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        if (renderResult.lastFrame()?.includes(text)) {
          return true;
        }
        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return false;
    },
  };
};

/**
 * Mock for testing keyboard events
 * @param stdin The stdin from render result
 * @param key The key to simulate
 */
export const simulateKeypress = (stdin: any, key: string) => {
  stdin.write(key);
};
