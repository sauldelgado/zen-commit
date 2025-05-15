#!/usr/bin/env node

import { parseArguments } from './cli';

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

  // This is just a temporary implementation
  // In future steps, we'll properly dispatch to command handlers
  console.log(`Zen Commit - Running '${command}' command`);
};

// Run the application
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
