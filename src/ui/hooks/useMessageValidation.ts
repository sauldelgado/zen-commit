import { useMemo } from 'react';

import { PatternMatch } from '../../core/patterns';

/**
 * Options for message validation
 */
export interface ValidationOptions {
  conventionalCommit?: boolean;
  subjectLengthLimit?: number;
  provideSuggestions?: boolean;
  detectPatterns?: boolean;
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
  patternMatches: PatternMatch[];
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

import { createPatternMatcher } from '../../core/patterns';

// Create a singleton pattern matcher for performance
const patternMatcher = createPatternMatcher({ includeBuiltIn: true });

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
    detectPatterns = true,
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
      patternMatches: [], // Initialize empty array for pattern matches
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

    // Detect patterns if enabled
    if (detectPatterns) {
      // Analyze using the pattern matcher
      const analysis = patternMatcher.analyzeMessage(message);
      result.patternMatches = analysis.matches;

      // Add pattern-based errors and warnings
      if (analysis.hasIssues) {
        // Add issues by severity to the respective arrays
        if (analysis.issuesBySeverity) {
          // Add errors
          if (analysis.issuesBySeverity.error && analysis.issuesBySeverity.error.length > 0) {
            const errorMessages = analysis.issuesBySeverity.error.map(
              (match) => `${match.name}: ${match.description}`,
            );
            result.errors.push(...errorMessages);

            // Mark as invalid if there are error-level issues
            if (errorMessages.length > 0) {
              result.isValid = false;
            }
          }

          // Add warnings
          if (analysis.issuesBySeverity.warning && analysis.issuesBySeverity.warning.length > 0) {
            const warningMessages = analysis.issuesBySeverity.warning.map(
              (match) => `${match.name}: ${match.description}`,
            );
            result.warnings.push(...warningMessages);
          }

          // Add info as suggestions
          if (
            provideSuggestions &&
            analysis.issuesBySeverity.info &&
            analysis.issuesBySeverity.info.length > 0
          ) {
            const infoMessages = analysis.issuesBySeverity.info
              .map((match) => match.suggestion || `${match.description}`)
              .filter(Boolean);
            result.suggestions.push(...infoMessages);
          }
        }
      }
    } else {
      // Set empty array when detection is disabled
      result.patternMatches = [];
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

      // Adjust quality score based on pattern matches
      if (detectPatterns && result.patternMatches.length > 0) {
        // Penalize based on pattern severity
        const errorPenalty = 0.3;
        const warningPenalty = 0.15;
        const infoPenalty = 0.05;

        // Count by severity
        const errorCount = result.patternMatches.filter((m) => m.severity === 'error').length;
        const warningCount = result.patternMatches.filter((m) => m.severity === 'warning').length;
        const infoCount = result.patternMatches.filter((m) => m.severity === 'info').length;

        // Apply penalties (diminishing returns for multiple issues)
        if (errorCount > 0) qualityScore -= Math.min(0.5, errorCount * errorPenalty);
        if (warningCount > 0) qualityScore -= Math.min(0.3, warningCount * warningPenalty);
        if (infoCount > 0) qualityScore -= Math.min(0.2, infoCount * infoPenalty);

        // Add pattern-based suggestions
        const patternSuggestions = result.patternMatches
          .filter((match) => match.suggestion)
          .map((match) => match.suggestion!)
          .filter(Boolean);

        // Add unique suggestions
        const uniqueSuggestions = patternSuggestions.filter(
          (suggestion) => !result.suggestions.includes(suggestion),
        );
        result.suggestions.push(...uniqueSuggestions);
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
  }, [message, conventionalCommit, subjectLengthLimit, provideSuggestions, detectPatterns]);
}
