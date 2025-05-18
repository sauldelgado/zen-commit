import { Pattern } from './pattern-detection';

/**
 * Pattern with optimization information
 */
export interface OptimizedPattern extends Pattern {
  quickCheck?: string[];
  priority?: number;
}

/**
 * Extract strings from regex pattern that can be used for quick rejection
 *
 * This function analyzes a regex pattern and extracts literal strings that can be used
 * to quickly determine if the pattern might match a given text. This is an optimization
 * technique that allows us to avoid running expensive regular expressions when we can
 * determine that they definitely won't match.
 *
 * The extraction works through these steps:
 * 1. Extract literal strings from the regex pattern (e.g., from 'abc' in /abc|def/)
 * 2. Extract sequences of alphanumeric characters (e.g., from /test123/)
 * 3. If no literals are found, fall back to keywords from the pattern ID and name
 *
 * The function only extracts strings that are at least 3 characters long to avoid
 * excessive false positives with very short strings.
 *
 * @param pattern The pattern to analyze
 * @returns Array of strings that must be present for the pattern to match
 */
const extractQuickCheckStrings = (pattern: Pattern): string[] => {
  const source = pattern.regex.source;

  // This is a simplified approach to extract literal strings from regex
  // A full implementation would parse the regex and extract required literals

  // Find literal strings that are at least 3 characters long
  const literalStrings: string[] = [];

  // Look for quoted strings or alphanumeric sequences of 3+ chars
  // This regex finds:
  // 1. Quoted strings: 'abc' or "abc"
  // 2. Unquoted alphanumeric sequences: abc123
  const quotedRegex = /['"][^'"]{3,}['"]|[a-z0-9_]{3,}/gi;

  let match;
  while ((match = quotedRegex.exec(source)) !== null) {
    let literal = match[0];

    // Remove quotes if present
    if (
      (literal.startsWith("'") && literal.endsWith("'")) ||
      (literal.startsWith('"') && literal.endsWith('"'))
    ) {
      literal = literal.slice(1, -1);
    }

    literalStrings.push(literal.toLowerCase());
  }

  // Look for keywords in the pattern ID and name as fallback
  if (literalStrings.length === 0) {
    const keywords = pattern.id
      .split('-')
      .concat(pattern.name.toLowerCase().split(/\s+/))
      .filter((k) => k.length >= 3)
      .map((k) => k.toLowerCase());

    if (keywords.length > 0) {
      return [...new Set(keywords)]; // Remove duplicates
    }
  }

  return literalStrings;
};

/**
 * Prioritize patterns by complexity and severity
 *
 * This function calculates a priority score for a pattern based on its severity and complexity.
 * Patterns with lower scores will be checked first in the optimized matching process.
 *
 * The priority calculation has two components:
 * 1. Severity-based priority: Errors have highest priority, followed by warnings, then info
 * 2. Complexity-based adjustment: More complex regex patterns get a lower priority
 *    because they are more expensive to evaluate
 *
 * Complexity is estimated based on:
 * - The length of the regex pattern (longer patterns are generally more complex)
 * - The presence of complex regex features (lookaheads, alternations, repetition)
 *
 * This prioritization helps optimize pattern matching by:
 * - Running simpler patterns first, which is more efficient
 * - Running more severe patterns first, so critical issues are found quickly
 *
 * @param pattern The pattern to analyze
 * @returns Priority score (lower is higher priority)
 */
const calculatePatternPriority = (pattern: Pattern): number => {
  // Base priority by severity
  const severityScore =
    {
      error: 0, // Highest priority (lowest score)
      warning: 10, // Medium priority
      info: 20, // Lowest priority (highest score)
    }[pattern.severity] || 30;

  // Adjust by regex complexity (estimated by length and features)
  const source = pattern.regex.source;
  let complexityScore = 0;

  // Length-based complexity
  complexityScore += source.length / 10;

  // Feature-based complexity
  if (source.includes('(?')) complexityScore += 5; // Non-capturing groups, lookaheads, etc.
  if (source.includes('|')) complexityScore += 3; // Alternation
  if (source.includes('*') || source.includes('+')) complexityScore += 2; // Repetition
  if (source.includes('{')) complexityScore += 2; // Range quantifiers

  // Simple patterns should be checked first
  return severityScore + complexityScore;
};

/**
 * Optimize patterns for faster matching
 *
 * This function takes an array of patterns and enhances them with optimization data
 * to improve matching performance. The optimized patterns include:
 *
 * 1. Quick check strings - Literal strings that must be present for the pattern to match,
 *    allowing fast rejection of patterns that definitely won't match
 *
 * 2. Priority scores - Calculated based on pattern severity and complexity,
 *    used to determine the order in which patterns should be checked
 *
 * The optimized patterns are then sorted by priority score, so the most important
 * and simplest patterns are checked first, improving overall performance.
 *
 * @param patterns Array of patterns to optimize
 * @returns Optimized patterns sorted by priority
 */
export const optimizePatterns = (patterns: Pattern[]): OptimizedPattern[] => {
  return (
    patterns
      .map((pattern) => {
        // Extract quick check strings for fast pattern rejection
        const quickCheck = extractQuickCheckStrings(pattern);

        // Calculate priority for ordering pattern checks
        const priority = calculatePatternPriority(pattern);

        return {
          ...pattern,
          quickCheck: quickCheck.length > 0 ? quickCheck : undefined,
          priority,
        };
      })
      // Sort patterns by priority (lower priority number = higher priority)
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
  );
};

/**
 * Enhanced pattern detection that uses optimization hints for quick rejection
 * @param text The text to analyze
 * @param patterns Array of optimized patterns to check
 * @returns Whether any pattern matches
 */
export const quickDetectPatterns = (text: string, patterns: OptimizedPattern[]): boolean => {
  // Avoid processing if no text or patterns
  if (!text || patterns.length === 0) {
    return false;
  }

  // Convert to lowercase once for case-insensitive quick checks
  const lowerText = text.toLowerCase();

  // Check each pattern in priority order
  for (const pattern of patterns) {
    // If we have quick check strings, use them for fast rejection
    if (pattern.quickCheck && pattern.quickCheck.length > 0) {
      // If any quick check string is present, the pattern might match
      const mightMatch = pattern.quickCheck.some((str) => lowerText.includes(str));

      // Skip this pattern if it definitely won't match
      if (!mightMatch) {
        continue;
      }
    }

    // Save and reset lastIndex to ensure we start from the beginning
    const originalLastIndex = pattern.regex.lastIndex;
    pattern.regex.lastIndex = 0;

    // Use test for fastest check (just checks if regex matches, not where)
    const matches = pattern.regex.test(text);

    // Restore original lastIndex
    pattern.regex.lastIndex = originalLastIndex;

    if (matches) {
      return true;
    }
  }

  // No patterns matched
  return false;
};
