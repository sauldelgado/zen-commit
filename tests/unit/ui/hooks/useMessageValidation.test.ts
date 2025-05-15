import { renderHook } from '@testing-library/react-hooks';
import { useMessageValidation } from '@ui/hooks';

describe('useMessageValidation Hook', () => {
  it('should validate general commit message formatting', () => {
    const { result } = renderHook(() => useMessageValidation('This is a test commit message', {}));

    expect(result.current.isValid).toBe(true);
    expect(result.current.subjectLength).toBe(30);
    expect(result.current.hasBody).toBe(false);
  });

  it('should identify subject and body in a commit message', () => {
    const { result } = renderHook(() => useMessageValidation('Subject line\n\nBody text here', {}));

    expect(result.current.subject).toBe('Subject line');
    expect(result.current.body).toBe('Body text here');
    expect(result.current.hasBody).toBe(true);
  });

  it('should validate subject line length', () => {
    const { result } = renderHook(() =>
      useMessageValidation(
        'This is a very long subject line that exceeds the recommended length limit for good commit messages',
        {
          subjectLengthLimit: 50,
        },
      ),
    );

    expect(result.current.isSubjectTooLong).toBe(true);
    expect(result.current.warnings).toContain('Subject line is too long');
  });

  it('should validate conventional commit format when enabled', () => {
    const { result } = renderHook(() =>
      useMessageValidation('feat(ui): add button component', {
        conventionalCommit: true,
      }),
    );

    expect(result.current.isConventionalCommit).toBe(true);
    expect(result.current.conventionalParts).toEqual(
      expect.objectContaining({
        type: 'feat',
        scope: 'ui',
        description: 'add button component',
      }),
    );
  });

  it('should identify invalid conventional commit format', () => {
    const { result } = renderHook(() =>
      useMessageValidation('add button component', {
        conventionalCommit: true,
      }),
    );

    expect(result.current.isConventionalCommit).toBe(false);
    expect(result.current.errors).toContain('Not a valid conventional commit format');
  });

  it('should provide quality suggestions for commit messages', () => {
    const { result } = renderHook(() =>
      useMessageValidation('fix bug', {
        provideSuggestions: true,
      }),
    );

    expect(result.current.qualityScore).toBeLessThan(0.7); // Lower score for vague message
    expect(result.current.suggestions.length).toBeGreaterThan(0);
  });
});
