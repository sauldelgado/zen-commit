import { renderHook } from '@testing-library/react-hooks';
import { useMessageValidation } from '../../../../src/ui/hooks/useMessageValidation';
import { PatternMatch } from '../../../../src/core/patterns';

describe('useMessageValidation with pattern detection', () => {
  it('should detect patterns in commit messages', () => {
    const { result } = renderHook(() =>
      useMessageValidation('WIP: Adding new feature', {
        provideSuggestions: true,
        detectPatterns: true,
      }),
    );

    // Check that we have pattern matches
    expect(result.current.patternMatches).toBeDefined();
    expect(result.current.patternMatches.length).toBeGreaterThan(0);

    // A WIP commit should be detected
    const wipMatch = result.current.patternMatches.find(
      (match: PatternMatch) => match.patternId === 'wip-commit',
    );
    expect(wipMatch).toBeDefined();

    // Check that pattern matches are reflected in errors/warnings
    expect(result.current.warnings.length).toBeGreaterThan(0);
    expect(result.current.qualityScore).toBeLessThan(1);
  });

  it('should not detect patterns when detection is disabled', () => {
    const { result } = renderHook(() =>
      useMessageValidation('WIP: Adding new feature', {
        provideSuggestions: true,
        detectPatterns: false,
      }),
    );

    // No pattern matches when feature is disabled
    expect(result.current.patternMatches).toEqual([]);
  });

  it('should incorporate pattern severity into validation result', () => {
    const { result } = renderHook(() =>
      useMessageValidation('fixup! This is a fixup commit', {
        provideSuggestions: true,
        detectPatterns: true,
      }),
    );

    // A fixup commit should be detected
    const fixupMatch = result.current.patternMatches.find(
      (match: PatternMatch) => match.patternId === 'fixup-commit',
    );
    expect(fixupMatch).toBeDefined();

    // Fixup commits are warnings, so should be in warnings array
    expect(result.current.warnings.some((warning) => warning.includes('Fixup Commit'))).toBe(true);

    // Empty commit messages are errors
    const { result: emptyResult } = renderHook(() =>
      useMessageValidation('   ', {
        provideSuggestions: true,
        detectPatterns: true,
      }),
    );

    expect(emptyResult.current.errors.some((error) => error.includes('empty'))).toBe(true);
  });

  it('should affect quality score based on pattern matches', () => {
    // Message with no patterns
    const { result: goodResult } = renderHook(() =>
      useMessageValidation('Add user authentication feature with proper validation', {
        provideSuggestions: true,
        detectPatterns: true,
      }),
    );

    // Message with multiple patterns
    const { result: badResult } = renderHook(() =>
      useMessageValidation('WIP: fix something', {
        provideSuggestions: true,
        detectPatterns: true,
      }),
    );

    // Good message should have higher quality score
    expect(goodResult.current.qualityScore).toBeGreaterThan(badResult.current.qualityScore);

    // Bad message should have at least one pattern match
    expect(badResult.current.patternMatches.length).toBeGreaterThan(0);
  });
});
