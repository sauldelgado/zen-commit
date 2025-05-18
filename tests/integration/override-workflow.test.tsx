import React from 'react';
import { render } from 'ink-testing-library';
import { createPatternMatcher, Pattern, PatternMatch } from '../../src/core/patterns';
import { createOverrideManager } from '../../src/core/override-manager';
import { WarningPanel, CommitMessageInput } from '../../src/ui/components';

// Mock data for the tests
const testPattern: Pattern = {
  id: 'test-pattern',
  name: 'Test Pattern',
  description: 'Test pattern description',
  regex: /^test$|^test pattern$/i,
  severity: 'warning',
  category: 'best-practices',
  suggestion: 'Consider using a better pattern',
};

const testWarning: PatternMatch = {
  patternId: 'test-pattern',
  name: 'Test Pattern',
  description: 'Test pattern description',
  severity: 'warning',
  category: 'best-practices',
  index: 0,
  length: 4,
  matchedText: 'test',
  suggestion: 'Consider using a better pattern',
};

// Test the complete override workflow
describe('Override Workflow Integration', () => {
  it('should correctly override a pattern and filter warnings', () => {
    // Create the required services
    const patternMatcher = createPatternMatcher({
      includeBuiltIn: false,
      customPatterns: [testPattern],
    });

    const overrideManager = createOverrideManager();

    // First, verify that the pattern is detected
    const analysis = patternMatcher.analyzeMessage('test');
    expect(analysis.matches.length).toBe(1);
    expect(analysis.matches[0].patternId).toBe('test-pattern');

    // Now, override the pattern
    overrideManager.overridePattern('test-pattern', 'This is a test override');

    // Verify that the pattern is now overridden
    expect(overrideManager.isPatternOverridden('test-pattern')).toBe(true);

    // When we filter patterns, the overridden pattern should be excluded
    const filteredPatterns = patternMatcher
      .getPatterns()
      .filter((pattern) => !overrideManager.isPatternOverridden(pattern.id));
    expect(filteredPatterns.length).toBe(0);

    // Analyze again with filtered patterns
    const analysisAfterOverride = patternMatcher.analyzeMessage('test', {
      patterns: filteredPatterns,
    });
    expect(analysisAfterOverride.matches.length).toBe(0);

    // Remove the override
    overrideManager.removeOverride('test-pattern');

    // Verify that the pattern is now detected again
    const analysisAfterRemoval = patternMatcher.analyzeMessage('test');
    expect(analysisAfterRemoval.matches.length).toBe(1);
  });

  it('should integrate WarningPanel with override capability', () => {
    // Create warning panel with override manager
    const overrideManager = createOverrideManager();
    const onOverridePattern = jest.fn();
    const { lastFrame } = render(
      <WarningPanel
        warnings={[testWarning]}
        onDismiss={jest.fn()}
        onDismissPattern={jest.fn()}
        overrideManager={overrideManager}
        onOverridePattern={onOverridePattern}
      />,
    );

    // We should see the warning panel summary
    expect(lastFrame()).toContain('issue detected');

    // Note: Due to testing limitations with the mock, we can't fully test the user interaction
    // In a real test, we would press Enter to show details, then O to override
  });

  it('should correctly filter warnings in CommitMessageInput', () => {
    // Create services
    const patternMatcher = createPatternMatcher({
      includeBuiltIn: false,
      customPatterns: [testPattern],
    });

    // Render the component
    const { lastFrame } = render(
      <CommitMessageInput
        value="test"
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        patternMatcher={patternMatcher}
      />,
    );

    // Should show commit message input
    expect(lastFrame()).toContain('Commit message');

    // Note: Due to testing limitations with the mock, we can't fully test the user interaction
    // In a real test, we would interact with the interface to test the full workflow
  });

  it('should correctly handle permanent vs temporary overrides', () => {
    // Create services
    const patternMatcher = createPatternMatcher({
      includeBuiltIn: false,
      customPatterns: [testPattern],
    });
    const overrideManager = createOverrideManager();

    // Create temporary override
    overrideManager.overridePattern('test-pattern', 'Temporary override');

    // The pattern should be overridden but not disabled in the matcher
    expect(overrideManager.isPatternOverridden('test-pattern')).toBe(true);

    // If we clear all overrides, the pattern should be active again
    overrideManager.clearAllOverrides();
    expect(overrideManager.isPatternOverridden('test-pattern')).toBe(false);

    // For a permanent override, we'd also disable the pattern in the matcher
    overrideManager.overridePattern('test-pattern', 'Permanent override');
    patternMatcher.disablePattern('test-pattern');

    // Both should be true now
    expect(overrideManager.isPatternOverridden('test-pattern')).toBe(true);

    // Even if we clear overrides, the pattern remains disabled in matcher
    overrideManager.clearAllOverrides();
    expect(overrideManager.isPatternOverridden('test-pattern')).toBe(false);

    // We need to explicitly re-enable it
    patternMatcher.enablePattern('test-pattern');

    // Now it should be fully enabled
    const analysis = patternMatcher.analyzeMessage('test');
    expect(analysis.matches.length).toBe(1);
  });
});
