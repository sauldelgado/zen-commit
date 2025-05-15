import { useMemo } from 'react';

/**
 * Options for message validation
 */
export interface ValidationOptions {
  conventionalCommit?: boolean;
  subjectLengthLimit?: number;
  provideSuggestions?: boolean;
}

/**
 * Conventional commit parts
 */
export interface ConventionalCommitParts {
  type: string;
  scope?: string;
  breaking: boolean;
  description: string;
}

/**
 * Result of message validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  qualityScore: number;
  subject: string;
  body: string;
  subjectLength: number;
  bodyLength: number;
  hasBody: boolean;
  isSubjectTooLong: boolean;
  isConventionalCommit: boolean;
  conventionalParts: ConventionalCommitParts | null;
}

// List of valid conventional commit types
const VALID_COMMIT_TYPES = [
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
 * Hook for validating commit messages
 * @param message The commit message to validate
 * @param options Validation options
 * @returns Validation result
 */
export function useMessageValidation(
  message: string,
  options: ValidationOptions,
): ValidationResult {
  const {
    conventionalCommit = false,
    subjectLengthLimit = 50,
    provideSuggestions = false,
  } = options;

  return useMemo(() => {
    // Initialize result
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      qualityScore: 0,
      subject: '',
      body: '',
      subjectLength: 0,
      bodyLength: 0,
      hasBody: false,
      isSubjectTooLong: false,
      isConventionalCommit: false,
      conventionalParts: null,
    };

    // Empty message is not valid
    if (!message.trim()) {
      result.isValid = false;
      result.errors.push('Commit message cannot be empty');
      return result;
    }

    // Split message into subject and body
    const parts = message.split(/\n\s*\n/);
    result.subject = parts[0].trim();
    result.body = parts.slice(1).join('\n\n').trim();

    // Check if message has a body
    result.hasBody = result.body.length > 0;

    // Calculate lengths
    result.subjectLength = result.subject.length;
    result.bodyLength = result.body.length;

    // Check subject length
    result.isSubjectTooLong = result.subjectLength > subjectLengthLimit;
    if (result.isSubjectTooLong) {
      result.warnings.push('Subject line is too long');
    }

    // Validate conventional commit format if enabled
    if (conventionalCommit) {
      const conventionalMatch = result.subject.match(/^([a-z]+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/);

      if (conventionalMatch) {
        const [, type, scope, breaking, description] = conventionalMatch;

        result.isConventionalCommit = true;
        result.conventionalParts = {
          type,
          scope: scope || undefined,
          breaking: breaking === '!',
          description,
        };

        // Check if type is valid
        if (!VALID_COMMIT_TYPES.includes(type)) {
          result.warnings.push(`Unknown commit type: ${type}`);
        }

        // Check description
        if (description.length < 5) {
          result.warnings.push('Description is too short');
        }
      } else {
        result.isConventionalCommit = false;
        result.errors.push('Not a valid conventional commit format');
        result.isValid = false;
      }
    }

    // Provide suggestions if enabled
    if (provideSuggestions) {
      // Generate quality score
      let qualityScore = 0.5; // Base score

      // Reward having a body
      if (result.hasBody) {
        qualityScore += 0.2;
      }

      // Penalize subject that's too short
      if (result.subjectLength < 10) {
        qualityScore -= 0.2;
        result.suggestions.push('Make the subject more descriptive');
      }

      // Reward conventional format
      if (result.isConventionalCommit) {
        qualityScore += 0.2;
      }

      // Penalize vague language
      const vagueTerms = ['fix', 'bug', 'issue', 'problem', 'update', 'change'];
      const hasVagueTerms = vagueTerms.some((term) =>
        result.subject.toLowerCase().split(/\s+/).includes(term),
      );

      if (hasVagueTerms) {
        qualityScore -= 0.1;
        result.suggestions.push('Be more specific about what was changed');
      }

      // Cap score between 0 and 1
      result.qualityScore = Math.max(0, Math.min(1, qualityScore));

      // Add general suggestions
      if (!result.hasBody && result.subjectLength > 30) {
        result.suggestions.push('Consider adding a body with more details');
      }

      if (!conventionalCommit && !result.subject.includes(':')) {
        result.suggestions.push('Consider using conventional commit format');
      }

      if (result.subject.toUpperCase() === result.subject) {
        result.suggestions.push('Avoid using ALL CAPS in commit messages');
      }
    }

    return result;
  }, [message, conventionalCommit, subjectLengthLimit, provideSuggestions]);
}
