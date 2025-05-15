/**
 * Available commands in Zen Commit
 */
export type Command =
  | 'commit' // Create a commit (default)
  | 'config' // Configure settings
  | 'help' // Show help
  | 'version' // Show version
  | 'init'; // Initialize configuration

/**
 * Global options available for all commands
 */
export interface GlobalOptions {
  verbose?: boolean; // Enable verbose output
  debug?: boolean; // Enable debug mode
  config?: string; // Path to config file
}

/**
 * Options for the commit command
 */
export interface CommitOptions extends GlobalOptions {
  message?: string; // Commit message
  template?: string; // Template to use
  noVerify?: boolean; // Skip pre-commit hooks
  editMessage?: boolean; // Open editor for message
  conventional?: boolean; // Use conventional commits
}

/**
 * Options for the config command
 */
export interface ConfigOptions extends GlobalOptions {
  action?: 'get' | 'set' | 'list' | 'unset'; // Config action
  key?: string; // Config key
  value?: string; // Config value
  global?: boolean; // Apply globally
}

/**
 * Options for the init command
 */
export interface InitOptions extends GlobalOptions {
  force?: boolean; // Overwrite existing config
}

/**
 * Union type for all command options
 */
export type CommandOptions = CommitOptions | ConfigOptions | InitOptions | GlobalOptions;

/**
 * Result of command parsing
 */
export interface ParseResult {
  command: Command;
  options: CommandOptions;
  args: string[];
}
