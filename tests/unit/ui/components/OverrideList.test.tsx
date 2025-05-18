import React from 'react';
import { render } from 'ink-testing-library';
import OverrideList from '../../../../src/ui/components/OverrideList';
import { OverrideRecord } from '../../../../src/core/override-manager';

describe('OverrideList Component', () => {
  const overrides: OverrideRecord[] = [
    {
      patternId: 'test-pattern-1',
      reason: 'Test reason 1',
      category: 'style',
      createdAt: new Date().toISOString(),
    },
    {
      patternId: 'test-pattern-2',
      reason: 'Test reason 2',
      category: 'best-practices',
      createdAt: new Date().toISOString(),
    },
  ];

  it('should render a list of overrides', () => {
    const { lastFrame } = render(
      <OverrideList overrides={overrides} onRemoveOverride={() => {}} />,
    );

    expect(lastFrame()).toContain('Active Overrides');
    expect(lastFrame()).toContain('test-pattern-1');
    expect(lastFrame()).toContain('Test reason 1');
    expect(lastFrame()).toContain('test-pattern-2');
    expect(lastFrame()).toContain('Test reason 2');
  });

  it('should handle empty overrides list', () => {
    const { lastFrame } = render(<OverrideList overrides={[]} onRemoveOverride={() => {}} />);

    expect(lastFrame()).toContain('No active overrides');
  });

  it('should call onRemoveOverride when an override is removed', () => {
    const onRemoveOverride = jest.fn();
    const { stdin } = render(
      <OverrideList overrides={overrides} onRemoveOverride={onRemoveOverride} />,
    );

    // Press 'r' to remove
    stdin.write('r');

    expect(onRemoveOverride).toHaveBeenCalledWith('test-pattern-1');
  });

  it('should allow navigation between overrides', () => {
    const { stdin, lastFrame } = render(
      <OverrideList overrides={overrides} onRemoveOverride={() => {}} />,
    );

    // Check initial selected override is the first one
    expect(lastFrame()).toContain('> test-pattern-1');

    // Simulate down arrow key press
    stdin.write('\x1B[B'); // Down arrow key

    // Check new selected override is the second one
    expect(lastFrame()).toContain('> test-pattern-2');
  });
});
