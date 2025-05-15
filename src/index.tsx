#!/usr/bin/env node

import { parseArguments, executeCommand } from './cli';

/**
 * Main entry point for the application
 */
const main = async (): Promise<void> => {
  // Parse command line arguments (skip the first two: node and script path)
  const args = process.argv.slice(2);
  const { command, options } = parseArguments(args);

  // Debug output
  if (options.debug) {
    console.log('Command:', command);
    console.log('Options:', options);
  }

  // Execute the command
  await executeCommand(command, options);
};

// Run the application
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
