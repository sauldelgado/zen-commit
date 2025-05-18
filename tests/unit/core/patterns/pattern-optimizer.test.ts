import {
  optimizePatterns,
  quickDetectPatterns,
  OptimizedPattern,
} from '../../../../src/core/patterns/pattern-optimizer';
import { Pattern } from '../../../../src/core/patterns/pattern-detection';

describe('Pattern Optimizer', () => {
  it('should optimize patterns for quick rejection', () => {
    const patterns: Pattern[] = [
      {
        id: 'pattern-1',
        name: 'Pattern 1',
        description: 'Test pattern 1',
        regex: /TODO: something/i,
        severity: 'warning',
        category: 'best-practices',
      },
      {
        id: 'pattern-2',
        name: 'Pattern 2',
        description: 'Test pattern 2',
        regex: /FIXME: something else/i,
        severity: 'error',
        category: 'best-practices',
      },
    ];

    const optimized = optimizePatterns(patterns);

    // Should have same number of patterns
    expect(optimized.length).toBe(patterns.length);

    // Should have quick check properties
    expect(optimized[0].quickCheck).toBeDefined();
    expect(optimized[1].quickCheck).toBeDefined();

    // First pattern should have "TODO" in quick check
    expect(optimized[0].quickCheck!.includes('todo')).toBe(true);

    // Second pattern should have "FIXME" in quick check
    expect(optimized[1].quickCheck!.includes('fixme')).toBe(true);
  });

  it('should handle patterns that cannot be optimized', () => {
    const patterns: Pattern[] = [
      {
        id: 'pattern-1',
        name: 'Pattern 1',
        description: 'Test pattern with complex regex',
        regex: /^\s*[a-z]+\s+\d+/i, // Doesn't have clear tokens to extract
        severity: 'warning',
        category: 'style',
      },
    ];

    const optimized = optimizePatterns(patterns);

    // Should still return the pattern even if it can't be optimized
    expect(optimized.length).toBe(patterns.length);
    expect(optimized[0].id).toBe('pattern-1');

    // Should extract at least the pattern name
    if (optimized[0].quickCheck) {
      expect(optimized[0].quickCheck.includes('pattern')).toBe(true);
    }
  });

  it('should extract multiple quick check strings from a pattern', () => {
    const patterns: Pattern[] = [
      {
        id: 'multiple-tokens',
        name: 'Multiple Tokens',
        description: 'Pattern with multiple tokens',
        regex: /important critical urgent/i,
        severity: 'warning',
        category: 'best-practices',
      },
    ];

    const optimized = optimizePatterns(patterns);

    expect(optimized[0].quickCheck).toBeDefined();
    expect(optimized[0].quickCheck!.length).toBeGreaterThan(1);
    expect(optimized[0].quickCheck).toContain('important');
    expect(optimized[0].quickCheck).toContain('critical');
    expect(optimized[0].quickCheck).toContain('urgent');
  });

  describe('quickDetectPatterns', () => {
    it('should quickly detect if any patterns match without full analysis', () => {
      const patterns: OptimizedPattern[] = optimizePatterns([
        {
          id: 'todo-pattern',
          name: 'TODO Pattern',
          description: 'Matches TODO',
          regex: /TODO/i,
          severity: 'warning',
          category: 'best-practices',
        },
        {
          id: 'fixme-pattern',
          name: 'FIXME Pattern',
          description: 'Matches FIXME',
          regex: /FIXME/i,
          severity: 'error',
          category: 'best-practices',
        },
      ]);

      // Text with matches
      expect(quickDetectPatterns('This has a TODO item', patterns)).toBe(true);
      expect(quickDetectPatterns('FIXME: Something is broken', patterns)).toBe(true);

      // Text without matches
      expect(quickDetectPatterns('This is a clean commit message', patterns)).toBe(false);
    });

    it('should perform full regex check when quick check passes', () => {
      // A pattern where quick check will pass but full regex might not
      const patterns: OptimizedPattern[] = optimizePatterns([
        {
          id: 'specific-todo',
          name: 'Specific TODO',
          description: 'Matches only certain TODOs',
          regex: /TODO: refactor/i, // Only TODOs about refactoring
          severity: 'warning',
          category: 'style',
        },
      ]);

      // Quick check will pass ("TODO" is found) but full regex fails
      expect(quickDetectPatterns('TODO: fix this later', patterns)).toBe(false);

      // Both quick check and full regex pass
      expect(quickDetectPatterns('TODO: refactor this code', patterns)).toBe(true);
    });

    it('should return false immediately if no text is provided', () => {
      const patterns: OptimizedPattern[] = optimizePatterns([
        {
          id: 'test-pattern',
          name: 'Test Pattern',
          description: 'Test pattern',
          regex: /test/i,
          severity: 'info',
          category: 'style',
        },
      ]);

      expect(quickDetectPatterns('', patterns)).toBe(false);
    });

    it('should handle simple regex patterns properly', () => {
      // Simple word pattern
      const patterns: OptimizedPattern[] = optimizePatterns([
        {
          id: 'word-pattern',
          name: 'Word Pattern',
          description: 'A simple word pattern',
          regex: /test/i,
          severity: 'info',
          category: 'style',
        },
      ]);

      expect(quickDetectPatterns('This contains a test word', patterns)).toBe(true);
      expect(quickDetectPatterns('No match here', patterns)).toBe(false);
    });
  });
});
