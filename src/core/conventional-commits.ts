/**
 * Types of conventional commits
 */
export type ConventionalCommitType =
  | 'feat' // A new feature
  | 'fix' // A bug fix
  | 'docs' // Documentation only changes
  | 'style' // Changes that do not affect the meaning of the code
  | 'refactor' // A code change that neither fixes a bug nor adds a feature
  | 'perf' // A code change that improves performance
  | 'test' // Adding missing tests or correcting existing tests
  | 'build' // Changes that affect the build system or external dependencies
  | 'ci' // Changes to our CI configuration files and scripts
  | 'chore' // Other changes that don't modify src or test files
  | 'revert'; // Reverts a previous commit

/**
 * List of valid conventional commit types
 */
export const VALID_COMMIT_TYPES: ConventionalCommitType[] = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

/**
 * Interface for a parsed conventional commit
 */
export interface ConventionalCommit {
  type: string;
  scope: string;
  description: string;
  body: string;
  footer: string;
  isBreakingChange: boolean;
  isValid: boolean;
}

/**
 * Validation result for a conventional commit
 */
export interface ConventionalCommitValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parse a commit message according to the Conventional Commits specification
 * @param message The commit message to parse
 * @returns Parsed commit object
 */
export function parseConventionalCommit(message: string): ConventionalCommit {
  // Initialize with default values
  const result: ConventionalCommit = {
    type: '',
    scope: '',
    description: '',
    body: '',
    footer: '',
    isBreakingChange: false,
    isValid: false,
  };

  // Split message into header, body, and footer
  const parts = message.split(/\n\s*\n/).map((part) => part.trim());
  const header = parts[0] || '';

  // Process body and footer parts
  if (parts.length > 1) {
    // If there are exactly 2 parts, the second is body
    if (parts.length === 2) {
      result.body = parts[1];
    } else {
      // With more than 2 parts, we need to determine what is body and what is footer
      // We'll consider any part containing a breaking change or key: value as footer
      const bodyParts = [];
      const footerParts = [];

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes('BREAKING CHANGE:') || part.match(/^\w+(-\w+)*:\s*.+$/m)) {
          footerParts.push(part);
        } else {
          bodyParts.push(part);
        }
      }

      result.body = bodyParts.join('\n\n');
      result.footer = footerParts.join('\n\n');
    }
  }

  // Parse header: type(scope): description
  const headerMatch = header.match(/^([a-z]+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/);

  if (!headerMatch) {
    return { ...result, isValid: false };
  }

  const [, type, scope, breakingChange, description] = headerMatch;

  result.type = type;
  result.scope = scope || '';
  result.description = description;
  result.isBreakingChange = !!breakingChange || result.footer.includes('BREAKING CHANGE:');
  result.isValid = VALID_COMMIT_TYPES.includes(type as ConventionalCommitType);

  return result;
}

/**
 * Format a conventional commit object into a commit message string
 * @param commit The commit object to format
 * @returns Formatted commit message
 */
export function formatConventionalCommit(commit: ConventionalCommit): string {
  let header = commit.type;

  if (commit.scope) {
    header += `(${commit.scope})`;
  }

  if (commit.isBreakingChange) {
    header += '!';
  }

  header += `: ${commit.description}`;

  let message = header;

  if (commit.body) {
    message += `\n\n${commit.body}`;
  }

  if (commit.footer) {
    message += `\n\n${commit.footer}`;
  }

  return message;
}

/**
 * Validate a conventional commit object
 * @param commit The commit object to validate
 * @returns Validation result
 */
export function validateConventionalCommit(
  commit: ConventionalCommit,
): ConventionalCommitValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate commit type
  if (!VALID_COMMIT_TYPES.includes(commit.type as ConventionalCommitType)) {
    errors.push(`Invalid commit type: ${commit.type}`);
  }

  // Validate description
  if (!commit.description) {
    errors.push('Description is required');
  } else if (commit.description.length > 100) {
    warnings.push('Description is too long (> 100 characters)');
  }

  // Check if description starts with a capital letter
  if (commit.description && commit.description[0].toUpperCase() !== commit.description[0]) {
    warnings.push('Description should start with a capital letter');
  }

  // Validate breaking changes
  if (commit.isBreakingChange && !commit.footer.includes('BREAKING CHANGE:')) {
    warnings.push('Breaking changes should be described in the footer');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
