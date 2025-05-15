/**
 * Wrapper for chalk to make it compatible with both ESM and CommonJS environments.
 * This avoids issues with ESM modules in Jest tests.
 */

// Simple interface matching the chalk methods we use
interface ChalkFunctions {
  cyan: (text: string) => string;
  green: (text: string) => string;
  yellow: (text: string) => string;
  blue: (text: string) => string;
}

// Check if we're in a test environment (Jest sets NODE_ENV to 'test')
const isTestEnv = process.env.NODE_ENV === 'test';

// Simple mock implementation for testing
const mockChalk: ChalkFunctions = {
  cyan: (text: string) => text,
  green: (text: string) => text,
  yellow: (text: string) => text,
  blue: (text: string) => text,
};

// In non-test environments, we'll try to use the real chalk
let chalkInstance: ChalkFunctions = mockChalk;

// Only try to import the real chalk in non-test environments
if (!isTestEnv) {
  try {
    // This is a dynamic import that will be executed at runtime
    // It's wrapped in a try-catch to handle any import failures gracefully

    const chalk = require('chalk');

    chalkInstance = {
      cyan: chalk.cyan,
      green: chalk.green,
      yellow: chalk.yellow,
      blue: chalk.blue,
    };
  } catch (error) {
    console.warn('Failed to import chalk, using fallback implementation');
  }
}

export default chalkInstance;
