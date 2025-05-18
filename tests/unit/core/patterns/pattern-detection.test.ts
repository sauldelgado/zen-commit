import {
  detectPatterns,
  Pattern,
  builtInPatterns,
} from '../../../../src/core/patterns/pattern-detection';

describe('Pattern Detection Engine', () => {
  describe('detectPatterns', () => {
    it('should detect regex patterns in text', () => {
      const patterns: Pattern[] = [
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'A test pattern that matches "TODO"',
          regex: /TODO/i,
          severity: 'warning',
          category: 'best-practices',
        },
      ];

      const text = 'This is a commit message with a TODO item';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(1);
      expect(matches[0].patternId).toBe('test-pattern');
      expect(matches[0].severity).toBe('warning');
    });

    it('should not return matches when no patterns match', () => {
      const patterns: Pattern[] = [
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'A test pattern that matches "TODO"',
          regex: /TODO/i,
          severity: 'warning',
          category: 'best-practices',
        },
      ];

      const text = 'This is a regular commit message';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(0);
    });

    it('should handle multiple pattern matches', () => {
      const patterns: Pattern[] = [
        {
          id: 'todo-pattern',
          name: 'TODO Pattern',
          description: 'A pattern that matches "TODO"',
          regex: /TODO/i,
          severity: 'warning',
          category: 'best-practices',
        },
        {
          id: 'fixme-pattern',
          name: 'FIXME Pattern',
          description: 'A pattern that matches "FIXME"',
          regex: /FIXME/i,
          severity: 'error',
          category: 'best-practices',
        },
      ];

      const text = 'FIXME: This commit has a TODO item and a FIXME note';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(2);
      expect(matches.some((m) => m.patternId === 'todo-pattern')).toBe(true);
      expect(matches.some((m) => m.patternId === 'fixme-pattern')).toBe(true);
    });

    it('should include match position information', () => {
      const patterns: Pattern[] = [
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'A test pattern',
          regex: /test/i,
          severity: 'info',
          category: 'style',
        },
      ];

      const text = 'This is a test commit message';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(1);
      expect(matches[0].index).toBe(10); // "test" starts at index 10
      expect(matches[0].length).toBe(4); // "test" is 4 characters long
    });

    it('should respect global regex flag to find all matches', () => {
      const patterns: Pattern[] = [
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'A test pattern',
          regex: /test/gi, // global flag
          severity: 'info',
          category: 'style',
        },
      ];

      const text = 'This test has multiple test occurrences in the test message';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(3);
    });

    it('should handle patterns with captured groups', () => {
      const patterns: Pattern[] = [
        {
          id: 'captured-pattern',
          name: 'Captured Pattern',
          description: 'A pattern with capture groups',
          regex: /(\w+)\s+(\d+)/,
          severity: 'info',
          category: 'style',
        },
      ];

      const text = 'version 123 is now released';
      const matches = detectPatterns(text, patterns);

      expect(matches.length).toBe(1);
      expect(matches[0].captures).toEqual(['version', '123']);
    });
  });

  describe('builtInPatterns', () => {
    it('should include patterns for common commit message issues', () => {
      // Check for specific built-in patterns
      expect(builtInPatterns.some((p) => p.id === 'wip-commit')).toBe(true);
      expect(builtInPatterns.some((p) => p.id === 'long-first-line')).toBe(true);
      expect(builtInPatterns.some((p) => p.id === 'non-imperative-mood')).toBe(true);
    });

    it('should detect common commit message issues', () => {
      // Test WIP commit pattern
      const wipCommit = 'WIP: still working on this feature';
      const wipMatches = detectPatterns(wipCommit, builtInPatterns);
      expect(wipMatches.some((m) => m.patternId === 'wip-commit')).toBe(true);

      // Test long first line pattern
      const longFirstLine =
        'This is a very long commit message that exceeds the recommended length limit for the first line of a commit message which should be kept under 72 characters';
      const longLineMatches = detectPatterns(longFirstLine, builtInPatterns);
      expect(longLineMatches.some((m) => m.patternId === 'long-first-line')).toBe(true);
    });

    it('should categorize patterns correctly', () => {
      // Check that patterns have categories
      expect(builtInPatterns.every((p) => p.category)).toBe(true);

      // Check for specific categories
      const categories = new Set(builtInPatterns.map((p) => p.category));
      expect(categories.has('best-practices')).toBe(true);
      expect(categories.has('formatting')).toBe(true);
      expect(categories.has('style')).toBe(true);
    });

    it('should provide suggestions for detected patterns', () => {
      // Check that patterns have suggestions
      expect(builtInPatterns.filter((p) => p.suggestion).length).toBeGreaterThan(0);

      // Test a specific pattern with suggestion
      const nonImperativeMood = 'Added a new feature to the application';
      const matches = detectPatterns(nonImperativeMood, builtInPatterns);
      const nonImperativeMatch = matches.find((m) => m.patternId === 'non-imperative-mood');

      expect(nonImperativeMatch).toBeDefined();
      expect(nonImperativeMatch?.suggestion).toBeDefined();
      expect(typeof nonImperativeMatch?.suggestion).toBe('string');
    });
  });
});
