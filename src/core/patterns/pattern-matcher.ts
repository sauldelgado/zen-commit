import {
  Pattern,
  PatternMatch,
  PatternSeverity,
  PatternCategory,
  detectPatterns,
  builtInPatterns,
} from './pattern-detection';

/**
 * Options for creating a pattern matcher
 */
export interface PatternMatcherOptions {
  /**
   * Whether to include built-in patterns (defaults to true)
   */
  includeBuiltIn?: boolean;

  /**
   * Custom patterns to add to the matcher
   */
  customPatterns?: Pattern[];

  /**
   * Pattern IDs to disable by default
   */
  disabledPatterns?: string[];

  /**
   * Maximum size of message to analyze (in characters)
   * Messages larger than this will be truncated
   * Defaults to 10000 characters
   */
  maxMessageSize?: number;

  /**
   * Maximum time (in milliseconds) to spend on pattern matching
   * If the operation takes longer, it will be aborted
   * Defaults to 1000ms (1 second)
   */
  matchTimeoutMs?: number;
}

/**
 * Interface for analysis options
 */
export interface AnalysisOptions {
  /**
   * Minimum severity level to include in results
   */
  minSeverity?: PatternSeverity;

  /**
   * Category to filter patterns by
   */
  category?: PatternCategory;

  /**
   * Whether to include disabled patterns
   */
  includeDisabled?: boolean;

  /**
   * Specific patterns to use for analysis instead of all patterns
   */
  patterns?: Pattern[];
}

/**
 * Interface for analysis results
 */
export interface AnalysisResult {
  matches: PatternMatch[];
  hasIssues: boolean;
  issuesByCategory?: Record<PatternCategory, PatternMatch[]>;
  issuesBySeverity?: Record<PatternSeverity, PatternMatch[]>;
}

/**
 * Interface for pattern matcher
 */
export interface PatternMatcher {
  /**
   * Analyze a commit message for pattern matches
   * @param message The message to analyze
   * @param options Analysis options
   * @returns Analysis results
   */
  analyzeMessage(message: string, options?: AnalysisOptions): AnalysisResult;

  /**
   * Get all registered patterns
   * @param category Optional category to filter patterns
   * @returns Array of patterns
   */
  getPatterns(category?: PatternCategory): Pattern[];

  /**
   * Disable a pattern by ID
   * @param patternId ID of the pattern to disable
   */
  disablePattern(patternId: string): void;

  /**
   * Enable a previously disabled pattern
   * @param patternId ID of the pattern to enable
   */
  enablePattern(patternId: string): void;

  /**
   * Add a new pattern or replace an existing one
   * @param pattern Pattern to add
   */
  addPattern(pattern: Pattern): void;

  /**
   * Get patterns that match in the given text
   * @param text Text to check against all patterns
   * @returns Array of matching patterns
   */
  getPatternsInText(text: string): Pattern[];
}

/**
 * Factory function to create a pattern matcher
 * @param options Matcher configuration options
 * @returns Configured pattern matcher
 */
export const createPatternMatcher = (options: PatternMatcherOptions = {}): PatternMatcher => {
  // Initialize with built-in patterns if requested
  const patterns: Pattern[] = options.includeBuiltIn !== false ? [...builtInPatterns] : [];

  // Add custom patterns if provided
  if (options.customPatterns) {
    patterns.push(...options.customPatterns);
  }

  // Track disabled patterns
  const disabledPatternIds = new Set<string>(options.disabledPatterns || []);

  // Set performance limits
  const maxMessageSize = options.maxMessageSize || 10000; // Default 10KB max
  const matchTimeoutMs = options.matchTimeoutMs || 1000; // Default 1 second timeout

  // Create a cache for pattern results to improve performance on repeated analyses
  const analysisCache = new Map<string, AnalysisResult>();

  return {
    /**
     * Analyze a commit message for pattern matches
     */
    analyzeMessage(message: string, analysisOptions: AnalysisOptions = {}): AnalysisResult {
      // Truncate message if it exceeds maximum size
      let analyzedMessage = message;
      const isTruncated = message.length > maxMessageSize;

      if (isTruncated) {
        analyzedMessage = message.substring(0, maxMessageSize);
      }

      // Generate cache key based on message and options
      const cacheKey = `${analyzedMessage}_${JSON.stringify(analysisOptions)}`;

      // Check cache first
      if (analysisCache.has(cacheKey)) {
        return { ...analysisCache.get(cacheKey)! };
      }

      // Use provided patterns or filter from all patterns
      let activePatterns: Pattern[];

      if (analysisOptions.patterns) {
        // Use the patterns provided in options
        activePatterns = analysisOptions.patterns;
      } else {
        // Filter patterns based on options
        activePatterns = patterns;

        // Filter out disabled patterns unless explicitly requested
        if (!analysisOptions.includeDisabled) {
          activePatterns = activePatterns.filter((p) => !disabledPatternIds.has(p.id));
        }

        // Filter by category if specified
        if (analysisOptions.category) {
          activePatterns = activePatterns.filter((p) => p.category === analysisOptions.category);
        }
      }

      // Use timeout to prevent regex from taking too long
      let matches: PatternMatch[] = [];

      try {
        // Set a timeout to prevent regex catastrophic backtracking
        const startTime = Date.now();

        // Detect all matches with timeout check
        matches = detectPatternsWithTimeout(
          analyzedMessage,
          activePatterns,
          startTime,
          matchTimeoutMs,
        );
      } catch (error) {
        // If timeout or regex error occurs, return empty matches
        console.warn(
          `Pattern matching aborted: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        matches = [];
      }

      /**
       * Helper function to detect patterns with a timeout
       */
      function detectPatternsWithTimeout(
        text: string,
        patternsToDetect: Pattern[],
        startTime: number,
        timeout: number,
      ): PatternMatch[] {
        // Use the main detectPatterns function but check time periodically
        const result: PatternMatch[] = [];

        // Process patterns in smaller batches to allow timeout checks
        const BATCH_SIZE = 5;

        for (let i = 0; i < patternsToDetect.length; i += BATCH_SIZE) {
          // Check if we've exceeded the timeout
          if (Date.now() - startTime > timeout) {
            throw new Error(`Pattern matching timeout exceeded (${timeout}ms)`);
          }

          // Process a batch of patterns
          const patternBatch = patternsToDetect.slice(i, i + BATCH_SIZE);
          const batchMatches = detectPatterns(text, patternBatch);
          result.push(...batchMatches);
        }

        return result;
      }

      // Filter by severity if requested
      if (analysisOptions.minSeverity) {
        const severityLevels: Record<PatternSeverity, number> = {
          info: 1,
          warning: 2,
          error: 3,
        };

        const minSeverityLevel = severityLevels[analysisOptions.minSeverity];

        matches = matches.filter((match) => severityLevels[match.severity] >= minSeverityLevel);
      }

      // Group issues by category and severity for easy filtering
      const issuesByCategory: Record<PatternCategory, PatternMatch[]> = {
        'best-practices': [],
        formatting: [],
        style: [],
        workflow: [],
        content: [],
      };

      const issuesBySeverity: Record<PatternSeverity, PatternMatch[]> = {
        info: [],
        warning: [],
        error: [],
      };

      // Populate the grouped issues
      for (const match of matches) {
        issuesByCategory[match.category].push(match);
        issuesBySeverity[match.severity].push(match);
      }

      // Determine if there are any issues
      const hasIssues = matches.length > 0;

      // Create the result
      const result: AnalysisResult = {
        matches,
        hasIssues,
        issuesByCategory,
        issuesBySeverity,
      };

      // Store in cache (limit cache size to prevent memory issues)
      if (analysisCache.size > 100) {
        // Remove oldest entry
        const firstKey = analysisCache.keys().next().value;
        if (firstKey) {
          analysisCache.delete(firstKey);
        }
      }
      analysisCache.set(cacheKey, { ...result });

      return result;
    },

    /**
     * Get all patterns (both enabled and disabled)
     */
    getPatterns(category?: PatternCategory): Pattern[] {
      let result = [...patterns];

      if (category) {
        result = result.filter((p) => p.category === category);
      }

      return result;
    },

    /**
     * Disable a pattern by ID
     */
    disablePattern(patternId: string): void {
      disabledPatternIds.add(patternId);
      // Clear cache since disabled patterns affect results
      analysisCache.clear();
    },

    /**
     * Enable a disabled pattern
     */
    enablePattern(patternId: string): void {
      disabledPatternIds.delete(patternId);
      // Clear cache since enabled patterns affect results
      analysisCache.clear();
    },

    /**
     * Add a new pattern
     */
    addPattern(pattern: Pattern): void {
      // Check if pattern with same ID already exists
      const existingIndex = patterns.findIndex((p) => p.id === pattern.id);

      if (existingIndex >= 0) {
        // Replace existing pattern
        patterns[existingIndex] = pattern;
      } else {
        // Add new pattern
        patterns.push(pattern);
      }

      // Clear cache since pattern set has changed
      analysisCache.clear();
    },

    /**
     * Get patterns that match in the given text
     */
    getPatternsInText(text: string): Pattern[] {
      const activePatterns = patterns.filter((p) => !disabledPatternIds.has(p.id));
      const matches = detectPatterns(text, activePatterns);

      // Return the unique patterns that matched
      const matchedPatternIds = new Set(matches.map((m) => m.patternId));
      return activePatterns.filter((p) => matchedPatternIds.has(p.id));
    },
  };
};
