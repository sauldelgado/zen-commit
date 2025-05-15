/**
 * Help text content for Zen Commit commands and options
 */

export const generalHelp = `
Zen Commit - A mindful Git commit experience

Usage:
  zen-commit [command] [options]

Commands:
  commit      Create a git commit (default command)
  config      Get and set configuration options
  init        Initialize configuration
  help        Display help information
  version     Display version information

Options:
  -v, --version      Output the current version
  --verbose          Enable verbose output
  --debug            Enable debug mode
  --config <path>    Path to config file
  -h, --help         Display help for command

Examples:
  $ zen-commit                     # Interactive commit experience
  $ zen-commit -m "Fix bug"        # Quick commit with message
  $ zen-commit config set template.scope ui

Run 'zen-commit help <command>' for more information on a specific command.
`;

export const commitHelp = `
Create a Git commit with a mindful experience

Usage:
  zen-commit commit [options]
  zen-commit [options]             # 'commit' is the default command

Options:
  -m, --message <message>    Specify commit message
  -t, --template <n>         Use a commit template
  -n, --no-verify            Skip pre-commit hooks
  -e, --edit-message         Open editor for commit message
  -c, --conventional         Use conventional commit format
  -h, --help                 Display this help message

Examples:
  $ zen-commit                             # Interactive commit experience
  $ zen-commit commit -m "Fix bug"         # Quick commit with message
  $ zen-commit -t feat -m "Add feature"    # Use 'feat' template
  $ zen-commit -c                          # Use conventional commit format

When run without options, Zen Commit provides an interactive experience to:
1. Review staged changes
2. Write a thoughtful commit message
3. Get feedback on message quality
4. Confirm and create the commit
`;

export const configHelp = `
Get and set Zen Commit configuration options

Usage:
  zen-commit config [action] [key] [value] [options]

Actions:
  get <key>             Get a configuration value
  set <key> <value>     Set a configuration value
  list                  List all configuration values (default)
  unset <key>           Remove a configuration value

Options:
  -g, --global          Apply setting globally
  -h, --help            Display this help message

Examples:
  $ zen-commit config list                      # List all configuration
  $ zen-commit config get template.scope        # Get a specific value
  $ zen-commit config set template.scope ui     # Set a value
  $ zen-commit config set template.scope ui -g  # Set a global value
  $ zen-commit config unset template.scope      # Remove a value

Configuration is stored in:
- Project-level: <project-root>/.zencommitrc.json
- Global-level: ~/.zencommitrc.json
`;

export const initHelp = `
Initialize Zen Commit configuration

Usage:
  zen-commit init [options]

Options:
  -f, --force           Overwrite existing configuration
  -h, --help            Display this help message

Examples:
  $ zen-commit init                # Initialize with interactive prompts
  $ zen-commit init --force        # Force overwrite existing config

This command creates a .zencommitrc.json file in the current directory.
It will prompt for common settings and configure sensible defaults.
`;

export const versionText = (version: string): string => `
Zen Commit v${version}

A mindful Git commit experience for developers who care about clarity,
intention, and craftsmanship.

https://github.com/sauldelgado/zen-commit
`;
