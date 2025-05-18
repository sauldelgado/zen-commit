import React from 'react';
import { render } from 'ink-testing-library';
import WarningPanel from '../../../../src/ui/components/WarningPanel';
import { PatternMatch } from '../../../../src/core/patterns/pattern-detection';

describe('WarningPanel Component', () => {
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

  it('should render warnings and show details on request', () => {
    const { lastFrame, stdin } = render(
      <WarningPanel warnings={warnings} onDismiss={() => {}} onDismissPattern={() => {}} />,
    );

    // Initial state should show warning count
    expect(lastFrame()).toContain('1 issue detected');

    // Press Enter to show details
    stdin.write('\r');

    // Details should now be visible
    expect(lastFrame()).toContain('Test Warning');
    expect(lastFrame()).toContain('This is a test warning');
  });

  it('should call onDismiss when dismissing warnings', () => {
    const onDismiss = jest.fn();
    const { stdin } = render(
      <WarningPanel warnings={warnings} onDismiss={onDismiss} onDismissPattern={() => {}} />,
    );

    // Press Enter to show details
    stdin.write('\r');

    // Press 'd' to dismiss
    stdin.write('d');

    expect(onDismiss).toHaveBeenCalled();
  });

  it('should call onDismissPattern when permanently dismissing a pattern', () => {
    const onDismissPattern = jest.fn();
    const { stdin } = render(
      <WarningPanel warnings={warnings} onDismiss={() => {}} onDismissPattern={onDismissPattern} />,
    );

    // Press Enter to show details
    stdin.write('\r');

    // Press 'p' to permanently dismiss
    stdin.write('p');

    expect(onDismissPattern).toHaveBeenCalledWith('test-warning');
  });

  it('should not render when no warnings are provided', () => {
    const { lastFrame } = render(
      <WarningPanel warnings={[]} onDismiss={() => {}} onDismissPattern={() => {}} />,
    );

    // Should be empty
    expect(lastFrame()?.trim() || '').toBe('');
  });
});
