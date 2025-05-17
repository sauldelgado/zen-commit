import {
  PatternMatcher,
  createPatternMatcher,
  PatternMatcherOptions,
} from '../../../../src/core/patterns/pattern-matcher';
import { Pattern } from '../../../../src/core/patterns/pattern-detection';

describe('Pattern Matcher', () => {
  let patternMatcher: PatternMatcher;
  let testPatterns: Pattern[];

  beforeEach(() => {
    testPatterns = [
      {
        id: 'test-pattern-1',
        name: 'Test Pattern 1',
        description: 'A test pattern that matches "TODO"',
        regex: /TODO/i,
        severity: 'warning',
        category: 'best-practices',
      },
      {
        id: 'test-pattern-2',
        name: 'Test Pattern 2',
        description: 'A test pattern that matches "FIXME"',
        regex: /FIXME/i,
        severity: 'error',
        category: 'best-practices',
      },
    ];

    const options: PatternMatcherOptions = {
      includeBuiltIn: true,
      customPatterns: testPatterns,
    };

    patternMatcher = createPatternMatcher(options);
  });

  describe('analyzeMessage', () => {
    it('should analyze a commit message and return matches', () => {
      const message = 'This is a TODO item that needs to be fixed';
      const result = patternMatcher.analyzeMessage(message);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(true);
    });

    it('should include hasIssues flag in analysis results', () => {
      const goodMessage = 'This is a well-formatted commit message';
      const badMessage = 'TODO: Fix this before committing';

      const goodResult = patternMatcher.analyzeMessage(goodMessage);
      const badResult = patternMatcher.analyzeMessage(badMessage);

      // Check a message with no problems
      expect(goodResult.hasIssues).toBe(false);

      // Check a message with problems
      expect(badResult.hasIssues).toBe(true);
    });

    it('should filter by severity if requested', () => {
      const message = 'FIXME: This TODO needs to be addressed';

      // Should include all severities by default
      const allResult = patternMatcher.analyzeMessage(message);
      expect(allResult.matches.some((m) => m.severity === 'warning')).toBe(true);
      expect(allResult.matches.some((m) => m.severity === 'error')).toBe(true);

      // Should filter to just errors
      const errorResult = patternMatcher.analyzeMessage(message, { minSeverity: 'error' });
      expect(errorResult.matches.some((m) => m.severity === 'warning')).toBe(false);
      expect(errorResult.matches.some((m) => m.severity === 'error')).toBe(true);
    });

    it('should filter by category if requested', () => {
      const formatPattern: Pattern = {
        id: 'format-pattern',
        name: 'Format Pattern',
        description: 'A test pattern for formatting',
        regex: /line too long/i,
        severity: 'warning',
        category: 'formatting',
      };

      patternMatcher.addPattern(formatPattern);

      const message = 'FIXME: The line too long in this commit';

      // Should include all categories by default
      const allResult = patternMatcher.analyzeMessage(message);
      expect(allResult.matches.some((m) => m.patternId === 'test-pattern-2')).toBe(true);
      expect(allResult.matches.some((m) => m.patternId === 'format-pattern')).toBe(true);

      // Should filter by category
      const formatResult = patternMatcher.analyzeMessage(message, { category: 'formatting' });
      expect(formatResult.matches.some((m) => m.patternId === 'test-pattern-2')).toBe(false);
      expect(formatResult.matches.some((m) => m.patternId === 'format-pattern')).toBe(true);
    });
  });

  describe('getPatterns', () => {
    it('should return all patterns', () => {
      const patterns = patternMatcher.getPatterns();

      // Should include at least our test patterns plus built-in patterns
      expect(patterns.length).toBeGreaterThanOrEqual(testPatterns.length);
      expect(patterns.some((p) => p.id === 'test-pattern-1')).toBe(true);
      expect(patterns.some((p) => p.id === 'test-pattern-2')).toBe(true);
    });

    it('should filter patterns by category when requested', () => {
      // Add pattern with different category
      patternMatcher.addPattern({
        id: 'workflow-pattern',
        name: 'Workflow Pattern',
        description: 'A test pattern for workflow',
        regex: /merge conflict/i,
        severity: 'warning',
        category: 'workflow',
      });

      // Get all patterns
      const allPatterns = patternMatcher.getPatterns();
      expect(allPatterns.some((p) => p.category === 'workflow')).toBe(true);

      // Get patterns filtered by category
      const bestPracticePatterns = patternMatcher.getPatterns('best-practices');
      expect(bestPracticePatterns.every((p) => p.category === 'best-practices')).toBe(true);
      expect(bestPracticePatterns.some((p) => p.category === 'workflow')).toBe(false);
    });
  });

  describe('disablePattern', () => {
    it('should disable a pattern by ID', () => {
      // Verify pattern works initially
      const initialMessage = 'This has a TODO item';
      const initialResult = patternMatcher.analyzeMessage(initialMessage);
      expect(initialResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(true);

      // Disable the pattern
      patternMatcher.disablePattern('test-pattern-1');

      // Verify pattern no longer matches
      const afterResult = patternMatcher.analyzeMessage(initialMessage);
      expect(afterResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(false);
    });

    it('should persist disabled patterns through different analyses', () => {
      patternMatcher.disablePattern('test-pattern-1');

      const result1 = patternMatcher.analyzeMessage('TODO in message 1');
      const result2 = patternMatcher.analyzeMessage('TODO in message 2');

      expect(result1.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(false);
      expect(result2.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(false);
    });
  });

  describe('enablePattern', () => {
    it('should enable a disabled pattern', () => {
      // Disable the pattern first
      patternMatcher.disablePattern('test-pattern-1');

      // Verify it's disabled
      const disabledResult = patternMatcher.analyzeMessage('This has a TODO item');
      expect(disabledResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(false);

      // Enable it again
      patternMatcher.enablePattern('test-pattern-1');

      // Verify it works now
      const enabledResult = patternMatcher.analyzeMessage('This has a TODO item');
      expect(enabledResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(true);
    });
  });

  describe('addPattern', () => {
    it('should add a new custom pattern', () => {
      const newPattern: Pattern = {
        id: 'new-pattern',
        name: 'New Pattern',
        description: 'A new test pattern',
        regex: /new-test-pattern/i,
        severity: 'info',
        category: 'style',
      };

      patternMatcher.addPattern(newPattern);

      // Verify the pattern was added
      const patterns = patternMatcher.getPatterns();
      expect(patterns.some((p) => p.id === 'new-pattern')).toBe(true);

      // Verify it works in analysis
      const result = patternMatcher.analyzeMessage('This contains a new-test-pattern to match');
      expect(result.matches.some((m) => m.patternId === 'new-pattern')).toBe(true);
    });

    it('should replace an existing pattern with the same ID', () => {
      // Original pattern
      const origPattern = patternMatcher.getPatterns().find((p) => p.id === 'test-pattern-1');
      expect(origPattern).toBeDefined();

      // Add replacement pattern with same ID
      const replacementPattern: Pattern = {
        id: 'test-pattern-1',
        name: 'Replaced Pattern',
        description: 'A replacement test pattern',
        regex: /replaced-pattern/i,
        severity: 'error',
        category: 'style',
      };

      patternMatcher.addPattern(replacementPattern);

      // Verify pattern was replaced
      const updatedPattern = patternMatcher.getPatterns().find((p) => p.id === 'test-pattern-1');
      expect(updatedPattern?.name).toBe('Replaced Pattern');

      // Verify old regex no longer matches
      const todoResult = patternMatcher.analyzeMessage('This has a TODO item');
      expect(todoResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(false);

      // Verify new regex matches
      const replacedResult = patternMatcher.analyzeMessage('This has a replaced-pattern item');
      expect(replacedResult.matches.some((m) => m.patternId === 'test-pattern-1')).toBe(true);
    });
  });

  describe('getPatternsInText', () => {
    it('should return all patterns that match in text', () => {
      const text = 'TODO: Fix before committing. Also FIXME: another issue';
      const matchingPatterns = patternMatcher.getPatternsInText(text);

      expect(matchingPatterns.length).toBe(2);
      expect(matchingPatterns.some((p) => p.id === 'test-pattern-1')).toBe(true);
      expect(matchingPatterns.some((p) => p.id === 'test-pattern-2')).toBe(true);
    });

    it('should return an empty array if no patterns match', () => {
      const text = 'This is a clean commit message with no issues';
      const matchingPatterns = patternMatcher.getPatternsInText(text);

      expect(matchingPatterns.length).toBe(0);
    });
  });

  describe('createPatternMatcher', () => {
    it('should create matcher with only custom patterns when includeBuiltIn is false', () => {
      const customOnly = createPatternMatcher({
        includeBuiltIn: false,
        customPatterns: testPatterns,
      });

      const patterns = customOnly.getPatterns();

      // Should only have our test patterns
      expect(patterns.length).toBe(testPatterns.length);
      expect(patterns.every((p) => testPatterns.some((tp) => tp.id === p.id))).toBe(true);
    });

    it('should create matcher with only built-in patterns when customPatterns are not provided', () => {
      const builtInOnly = createPatternMatcher({ includeBuiltIn: true });

      const patterns = builtInOnly.getPatterns();

      // Should not include any of our test patterns
      expect(patterns.every((p) => !testPatterns.some((tp) => tp.id === p.id))).toBe(true);
    });
  });
});
