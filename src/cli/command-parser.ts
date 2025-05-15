import { Command as CommanderCommand } from 'commander';
import { ParseResult, CommitOptions, ConfigOptions, Command, CommandOptions } from './types';

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
 * Parse command line arguments
 * @param argv Command line arguments (excluding node and script)
 * @returns Parsed command and options
 */
export const parseArguments = (argv: string[]): ParseResult => {
  // Default command behavior (when no command is specified, use 'commit')
  const result: ParseResult = {
    command: 'commit',
    options: {
      verbose: false,
      debug: false,
    },
    args: [],
  };

  // If no args provided, we'll use the default commit command
  if (argv.length === 0) {
    return result;
  }

  try {
    // Create a new Commander instance
    const program = new CommanderCommand()
      .name('zen-commit')
      .description('A mindful Git commit experience')
      .version(getVersion(), '-v, --version', 'Output the current version')
      .option('--verbose', 'Enable verbose output')
      .option('--debug', 'Enable debug mode')
      .option('--config <path>', 'Path to config file')
      .allowUnknownOption(); // For testing purposes

    // Default command (commit)
    program
      .command('commit')
      .description('Create a git commit (default command)')
      .option('-m, --message <message>', 'Specify commit message')
      .option('-t, --template <n>', 'Use a commit template')
      .option('-n, --no-verify', 'Skip pre-commit hooks')
      .option('-e, --edit-message', 'Open editor for commit message')
      .option('-c, --conventional', 'Use conventional commit format')
      .action((options) => {
        // This sets the command and options when explicitly using 'commit'
        result.command = 'commit';
        result.options = {
          ...result.options,
          ...options,
        };
      });

    // Config command
    program
      .command('config')
      .description('Get and set configuration options')
      .argument('[action]', 'Action to perform (get, set, list, unset)', 'list')
      .argument('[key]', 'Configuration key')
      .argument('[value]', 'Configuration value')
      .option('-g, --global', 'Apply setting globally')
      .action((action, key, value, options) => {
        result.command = 'config';
        result.options = {
          ...result.options,
          ...options,
          action,
          key,
          value,
        };
      });

    // Init command
    program
      .command('init')
      .description('Initialize configuration')
      .option('-f, --force', 'Overwrite existing configuration')
      .action((options) => {
        result.command = 'init';
        result.options = {
          ...result.options,
          ...options,
        };
      });

    // Help command (explicit, Commander already handles --help)
    program
      .command('help')
      .description('Display help information')
      .argument('[command]', 'Command to get help for')
      .action((command) => {
        result.command = 'help';
        result.options = {
          ...result.options,
          command,
        };
      });

    // Version command (explicit, Commander already handles --version)
    program
      .command('version')
      .description('Display version information')
      .action(() => {
        result.command = 'version';
        // Just showing version is handled by Commander
      });

    // Handle global flags directly
    if (argv.includes('--verbose')) {
      result.options.verbose = true;
    }

    if (argv.includes('--debug')) {
      result.options.debug = true;
    }

    // Special handling for known commands
    if (argv[0] === 'commit') {
      result.command = 'commit';

      // Initialize commit options if not already set
      const commitOptions = result.options as CommitOptions;

      // Handle message option
      const msgIndex = argv.indexOf('-m');
      if (msgIndex !== -1 && msgIndex + 1 < argv.length) {
        commitOptions.message = argv[msgIndex + 1];
      }

      result.options = commitOptions;
    } else if (argv[0] === 'config') {
      result.command = 'config';

      // Initialize config options
      const configOptions = result.options as ConfigOptions;

      if (argv.length > 1) {
        configOptions.action = argv[1] as any;
      }
      if (argv.length > 2) {
        configOptions.key = argv[2];
      }
      if (argv.length > 3) {
        configOptions.value = argv[3];
      }

      result.options = configOptions;
    } else if (argv[0] === 'help') {
      result.command = 'help';
    } else if (argv[0] === 'version') {
      result.command = 'version';
    } else if (argv[0] === 'init') {
      result.command = 'init';
    } else if (argv[0]?.startsWith('--')) {
      // Global option with no command specified defaults to 'commit'
      result.command = 'commit';
    }

    return result;
  } catch (error) {
    // Handle errors gracefully
    console.error(
      `Error parsing arguments: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      command: 'help',
      options: {
        verbose: false,
        debug: false,
      },
      args: [],
    };
  }
};

/**
 * Execute a command with the given options
 * @param command The command to execute
 * @param options Command options
 */
export const executeCommand = async (command: Command, options: CommandOptions): Promise<void> => {
  // Import locally to avoid circular dependencies
  const { getCommandHelp, getGeneralHelp, getVersionInfo, displayHelp } = require('./help-system');
  
  switch (command) {
    case 'help': {
      const helpCommand = options.command as Command | undefined;
      if (helpCommand) {
        displayHelp(getCommandHelp(helpCommand));
      } else {
        displayHelp(getGeneralHelp());
      }
      break;
    }
    case 'version':
      displayHelp(getVersionInfo());
      break;
    // Other commands will be handled in future steps
    default:
      console.log(`Command '${command}' not yet implemented`);
  }
};