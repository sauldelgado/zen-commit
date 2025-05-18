/**
 * Severity levels for patterns
 * - info: Informational issues that are style preferences but don't affect commit quality
 * - warning: Issues that may indicate problems but aren't critical
 * - error: Critical issues that should be fixed before committing
 */
export type PatternSeverity = 'info' | 'warning' | 'error';

/**
 * Pattern categories for organizing patterns into logical groups
 * - best-practices: Patterns related to general Git best practices
 * - formatting: Patterns related to message structure and formatting
 * - style: Patterns related to writing style and language
 * - workflow: Patterns related to Git workflow and process
 * - content: Patterns related to the actual content of the message
 */
export type PatternCategory = 'best-practices' | 'formatting' | 'style' | 'workflow' | 'content';

/**
 * Pattern definition interface
 *
 * A pattern represents a rule or convention that commit messages should follow.
 * Each pattern includes a regex to detect violations and metadata to help users
 * understand and fix the issue.
 *
 * @property id - Unique identifier for the pattern
 * @property name - Human-readable name
 * @property description - Detailed description of what the pattern checks for
 * @property regex - Regular expression used to detect the pattern in text
 * @property severity - How serious the issue is (info, warning, error)
 * @property category - Logical grouping for the pattern
 * @property suggestion - Optional advice on how to fix the issue
 * @property contextualExamples - Optional examples of good and bad messages
 * @property version - Optional version string for tracking pattern changes
 */
export interface Pattern {
  id: string;
  name: string;
  description: string;
  regex: RegExp;
  severity: PatternSeverity;
  category: PatternCategory;
  suggestion?: string;
  contextualExamples?: {
    good: string[];
    bad: string[];
  };
  version?: string;
}

/**
 * Pattern match result interface
 *
 * Represents an instance where a pattern was detected in text.
 * Contains information about both the pattern and the specific match found.
 *
 * @property patternId - ID of the matched pattern
 * @property name - Name of the matched pattern
 * @property description - Description of the pattern
 * @property severity - Severity level of the pattern
 * @property category - Category of the pattern
 * @property index - Starting character position of the match in the text
 * @property length - Length of the matched text
 * @property matchedText - The actual text that matched the pattern
 * @property suggestion - Optional suggestion for fixing the issue
 * @property captures - Optional capture groups from the regex match
 */
export interface PatternMatch {
  patternId: string;
  name: string;
  description: string;
  severity: PatternSeverity;
  category: PatternCategory;
  index: number;
  length: number;
  matchedText: string;
  suggestion?: string;
  captures?: string[];
}

/**
 * Detect patterns in a text string
 * @param text The text to analyze
 * @param patterns Array of patterns to check
 * @returns Array of pattern matches
 */
export const detectPatterns = (text: string, patterns: Pattern[]): PatternMatch[] => {
  const matches: PatternMatch[] = [];

  // Avoid processing if no text or patterns
  if (!text || patterns.length === 0) {
    return matches;
  }

  // Test each pattern against the text
  for (const pattern of patterns) {
    // Skip patterns with invalid regex
    if (!pattern.regex) continue;

    // Save and reset lastIndex to ensure we find all matches
    const originalLastIndex = pattern.regex.lastIndex;
    pattern.regex.lastIndex = 0;

    // Use exec with global flag to find all matches
    if (pattern.regex.global) {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        // Extract any capture groups
        const captures = match.slice(1).filter(Boolean);

        matches.push({
          patternId: pattern.id,
          name: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          category: pattern.category,
          index: match.index,
          length: match[0].length,
          matchedText: match[0],
          suggestion: pattern.suggestion,
          captures: captures.length > 0 ? captures : undefined,
        });

        // Avoid infinite loops with zero-length matches
        if (match.index === pattern.regex.lastIndex) {
          pattern.regex.lastIndex++;
        }
      }
    } else {
      // For non-global regex, just find the first match
      const match = pattern.regex.exec(text);
      if (match !== null) {
        // Extract any capture groups
        const captures = match.slice(1).filter(Boolean);

        matches.push({
          patternId: pattern.id,
          name: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          category: pattern.category,
          index: match.index,
          length: match[0].length,
          matchedText: match[0],
          suggestion: pattern.suggestion,
          captures: captures.length > 0 ? captures : undefined,
        });
      }
    }

    // Restore original lastIndex
    pattern.regex.lastIndex = originalLastIndex;
  }

  return matches;
};

/**
 * Built-in patterns for common commit message issues
 */
export const builtInPatterns: Pattern[] = [
  {
    id: 'wip-commit',
    name: 'Work In Progress',
    description: 'Avoid committing work-in-progress changes',
    regex: /^(WIP|wip):|^(Work in progress|work in progress)/i,
    severity: 'warning',
    category: 'best-practices',
    suggestion: 'Complete the work before committing, or use git stash instead',
    contextualExamples: {
      bad: ['WIP: still working on this feature', 'work in progress: not ready yet'],
      good: ['Add user authentication feature', 'Fix login redirect issue'],
    },
    version: '1.0.0',
  },
  {
    id: 'long-first-line',
    name: 'Long First Line',
    description: 'First line should be 72 characters or less',
    regex: /^.{73,}/,
    severity: 'warning',
    category: 'formatting',
    suggestion: 'Keep the first line short and concise (50-72 characters)',
    contextualExamples: {
      bad: [
        'This is a very long commit message that exceeds the recommended length limit for the first line of a commit message which should be kept under 72 characters',
      ],
      good: ['Fix user authentication bug in login component'],
    },
    version: '1.0.0',
  },
  {
    id: 'non-imperative-mood',
    name: 'Non-Imperative Mood',
    description: 'Use imperative mood in commit messages',
    regex: /^(Added|Fixed|Updated|Removed|Changed|Implemented|Refactored|Improved)/i,
    severity: 'info',
    category: 'style',
    suggestion: 'Use imperative mood (e.g., "Add feature" instead of "Added feature")',
    contextualExamples: {
      bad: ['Added user authentication', 'Fixed login bug', 'Updated documentation'],
      good: ['Add user authentication', 'Fix login bug', 'Update documentation'],
    },
    version: '1.0.0',
  },
  {
    id: 'trailing-period',
    name: 'Trailing Period',
    description: 'First line should not end with a period',
    regex: /^[^\n]*\.$/m,
    severity: 'info',
    category: 'formatting',
    suggestion: 'Remove the trailing period from the first line',
    contextualExamples: {
      bad: ['Add user authentication.', 'Fix login redirect issue.'],
      good: ['Add user authentication', 'Fix login redirect issue'],
    },
    version: '1.0.0',
  },
  {
    id: 'merge-commit',
    name: 'Merge Commit',
    description: 'Avoid merge commits in feature branches',
    regex: /^Merge branch|^Merge remote-tracking branch|^Merge pull request/,
    severity: 'info',
    category: 'workflow',
    suggestion: 'Consider using git rebase instead of git merge',
    contextualExamples: {
      bad: [
        "Merge branch 'main' into feature-branch",
        'Merge pull request #123 from username/feature',
      ],
      good: ['Add feature X', 'Fix issue with Y'],
    },
    version: '1.0.0',
  },
  {
    id: 'fixup-commit',
    name: 'Fixup Commit',
    description: 'Temporary fixup commit detected',
    regex: /^fixup!|^squash!/i,
    severity: 'warning',
    category: 'workflow',
    suggestion: 'This commit should be squashed before being pushed',
    contextualExamples: {
      bad: ['fixup! Add user authentication', 'squash! Fix login bug'],
      good: ['Add user authentication', 'Fix login bug'],
    },
    version: '1.0.0',
  },
  {
    id: 'empty-message',
    name: 'Empty Message',
    description: 'Commit message should not be empty',
    regex: /^(\s*|\s*#.*)$/,
    severity: 'error',
    category: 'best-practices',
    suggestion: 'Add a meaningful commit message describing the changes',
    contextualExamples: {
      bad: ['', '# With just a comment'],
      good: ['Add user authentication', 'Fix login redirect issue'],
    },
    version: '1.0.0',
  },
  {
    id: 'vague-message',
    name: 'Vague Message',
    description: 'Commit message is too vague',
    regex: /^(fix|update|change|improve|refactor|cleanup)(\s+something|$)/i,
    severity: 'warning',
    category: 'content',
    suggestion: 'Be specific about what was changed and why',
    contextualExamples: {
      bad: ['Fix something', 'Update code', 'Change stuff', 'Improve things'],
      good: ['Fix user authentication timeout bug', 'Update React to version 18.2.0'],
    },
    version: '1.0.0',
  },
  {
    id: 'issue-only',
    name: 'Issue Reference Only',
    description: 'Commit message contains only an issue reference',
    regex: /^(fix|resolve|close|fixes|resolves|closes)?\s*#\d+$/i,
    severity: 'warning',
    category: 'content',
    suggestion: 'Include a description of what was changed, not just the issue number',
    contextualExamples: {
      bad: ['#123', 'Fixes #456', 'Resolves #789'],
      good: ['Fix login timeout issue (#123)', 'Add user profile editing (#456)'],
    },
    version: '1.0.0',
  },
  {
    id: 'mixed-tense',
    name: 'Mixed Tense',
    description: 'Mixing past and present tense in commit message',
    regex: /(Added|Fixed|Updated|Removed|Changed).*?\b(add|fix|update|remove|change)\b/i,
    severity: 'info',
    category: 'style',
    suggestion: 'Use consistent tense (preferably imperative present tense)',
    contextualExamples: {
      bad: ['Added login and fix signup', 'Fixed auth and update styles'],
      good: ['Add login and fix signup', 'Fix auth and update styles'],
    },
    version: '1.0.0',
  },
];
