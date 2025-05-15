import { generalHelp, commitHelp, configHelp, initHelp, versionText } from './help-content';
import { Command } from './types';
import chalk from '../utils/chalk-wrapper';

/**
 * Get the package version from package.json
 */
const getVersion = (): string => {
  try {
    const pkg = require('../../package.json');
    return pkg.version || '0.0.0';
  } catch (error) {
    return '0.0.0';
  }
};

/**
 * Format help text with colors and styling
 * @param text The text to format
 * @returns Formatted text
 */
export const formatHelpText = (text: string): string => {
  // Apply various formatting transformations to make help text more readable

  // Format command names
  let formatted = text.replace(/([^\s]+)(?=\s+Create a |\s+Get and set|:\s+)/g, chalk.cyan('$1'));

  // Format option flags
  formatted = formatted.replace(/(-[^\s,]+|--[^\s]+)/g, chalk.green('$1'));

  // Format sections
  formatted = formatted.replace(
    /^(Usage|Commands|Options|Examples|Actions):/gm,
    chalk.yellow('$1:'),
  );

  // Format URLs
  formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, chalk.blue('$1'));

  // Format numbered list indicators
  formatted = formatted.replace(/^(\s*)(\d+\.)/gm, `$1${chalk.yellow('$2')}`);

  return formatted;
};

/**
 * Get general help information
 * @returns Formatted help text
 */
export const getGeneralHelp = (): string => {
  return formatHelpText(generalHelp);
};

/**
 * Get help for a specific command
 * @param command The command to get help for
 * @returns Formatted help text for the command
 */
export const getCommandHelp = (command: Command): string => {
  switch (command) {
    case 'commit':
      return formatHelpText(commitHelp);
    case 'config':
      return formatHelpText(configHelp);
    case 'init':
      return formatHelpText(initHelp);
    case 'help':
      return formatHelpText(generalHelp);
    case 'version':
      return getVersionInfo();
    default:
      return formatHelpText(`
Command not found: ${command}

Available commands:
- commit    Create a git commit
- config    Get and set configuration options
- init      Initialize configuration
- help      Display help information
- version   Display version information

Run 'zen-commit help' for general help.
      `);
  }
};

/**
 * Get version information
 * @returns Formatted version info
 */
export const getVersionInfo = (): string => {
  return formatHelpText(versionText(getVersion()));
};

/**
 * Display help text to the console
 * @param helpText The help text to display
 */
export const displayHelp = (helpText: string): void => {
  console.log(helpText);
};
