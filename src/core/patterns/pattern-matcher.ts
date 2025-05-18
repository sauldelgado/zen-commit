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
  includeBuiltIn?: boolean;
  customPatterns?: Pattern[];
  disabledPatterns?: string[];
}

/**
 * Interface for analysis options
 */
export interface AnalysisOptions {
  minSeverity?: PatternSeverity;
  category?: PatternCategory;
  includeDisabled?: boolean;
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

  // Create a cache for pattern results to improve performance on repeated analyses
  const analysisCache = new Map<string, AnalysisResult>();

  return {
    /**
     * Analyze a commit message for pattern matches
     */
    analyzeMessage(message: string, analysisOptions: AnalysisOptions = {}): AnalysisResult {
      // Generate cache key based on message and options
      const cacheKey = `${message}_${JSON.stringify(analysisOptions)}`;

      // Check cache first
      if (analysisCache.has(cacheKey)) {
        return { ...analysisCache.get(cacheKey)! };
      }

      // Filter patterns based on options
      let activePatterns = patterns;

      // Filter out disabled patterns unless explicitly requested
      if (!analysisOptions.includeDisabled) {
        activePatterns = activePatterns.filter((p) => !disabledPatternIds.has(p.id));
      }

      // Filter by category if specified
      if (analysisOptions.category) {
        activePatterns = activePatterns.filter((p) => p.category === analysisOptions.category);
      }

      // Detect all matches
      let matches = detectPatterns(message, activePatterns);

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
