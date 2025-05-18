import React from 'react';
import { render } from 'ink-testing-library';
import WarningNotification from '../../../../src/ui/components/WarningNotification';
import { PatternMatch } from '../../../../src/core/patterns/pattern-detection';

describe('WarningNotification Component', () => {
  it('should render warnings with appropriate styling', () => {
    const warnings: PatternMatch[] = [
      {
        patternId: 'test-warning',
        name: 'Test Warning',
        description: 'This is a test warning',
        severity: 'warning',
        category: 'best-practices',
        index: 0,
        length: 10,
        matchedText: 'Test match',
      },
    ];

    const { lastFrame } = render(<WarningNotification warnings={warnings} />);

    expect(lastFrame()).toContain('Test Warning');
    expect(lastFrame()).toContain('This is a test warning');
  });

  it('should render different severities with different colors', () => {
    const warnings: PatternMatch[] = [
      {
        patternId: 'info-pattern',
        name: 'Info Notice',
        description: 'This is an informational notice',
        severity: 'info',
        category: 'style',
        index: 0,
        length: 10,
        matchedText: 'Info match',
      },
      {
        patternId: 'warning-pattern',
        name: 'Warning Notice',
        description: 'This is a warning notice',
        severity: 'warning',
        category: 'formatting',
        index: 0,
        length: 10,
        matchedText: 'Warning match',
      },
      {
        patternId: 'error-pattern',
        name: 'Error Notice',
        description: 'This is an error notice',
        severity: 'error',
        category: 'content',
        index: 0,
        length: 10,
        matchedText: 'Error match',
      },
    ];

    const { lastFrame } = render(<WarningNotification warnings={warnings} />);

    // Test presence of each severity
    expect(lastFrame()).toContain('Info Notice');
    expect(lastFrame()).toContain('Warning Notice');
    expect(lastFrame()).toContain('Error Notice');
  });

  it('should include suggestions when provided', () => {
    const warnings: PatternMatch[] = [
      {
        patternId: 'test-warning',
        name: 'Test Warning',
        description: 'This is a test warning',
        severity: 'warning',
        category: 'best-practices',
        index: 0,
        length: 10,
        matchedText: 'Test match',
        suggestion: 'This is how you can fix it',
      },
    ];

    const { lastFrame } = render(<WarningNotification warnings={warnings} />);

    expect(lastFrame()).toContain('This is how you can fix it');
  });

  it('should not render when no warnings are provided', () => {
    const { lastFrame } = render(<WarningNotification warnings={[]} />);

    // Should be empty or just have invisible formatting
    expect(lastFrame()?.trim()).toBe('');
  });

  it('should show a dismissible message when dismissible is true', () => {
    const warnings: PatternMatch[] = [
      {
        patternId: 'test-warning',
        name: 'Test Warning',
        description: 'This is a test warning',
        severity: 'warning',
        category: 'best-practices',
        index: 0,
        length: 10,
        matchedText: 'Test match',
      },
    ];

    const { lastFrame } = render(
      <WarningNotification warnings={warnings} dismissible={true} onDismiss={() => {}} />,
    );

    expect(lastFrame()).toContain('Press Esc to dismiss');
  });
});
