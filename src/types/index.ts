// Common shared types across the application

/**
 * Common command line options used throughout the application
 */
export interface CommandOptions {
  debug?: boolean;
  verbose?: boolean;
  [key: string]: unknown;
}

/**
 * Git repository information 
 */
export interface GitRepository {
  isRepository: boolean;
  root?: string;
  branch?: string;
}

// Add more shared types as the project grows