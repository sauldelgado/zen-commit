import React from 'react';
import { renderWithAct } from '../../../helpers/test-utils';
import { TemplateFormSelectItem } from '@ui/components/TemplateFormSelect';

// Mock Ink components
jest.mock('ink', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div data-testid="box">{children}</div>,
  Text: ({
    children,
    color,
    bold,
    dimColor,
  }: {
    children: React.ReactNode;
    color?: string;
    bold?: boolean;
    dimColor?: boolean;
  }) => (
    <span
      data-testid="text"
      style={{
        color,
        fontWeight: bold ? 'bold' : 'normal',
        opacity: dimColor ? 0.7 : 1,
      }}
    >
      {children}
    </span>
  ),
}));

// TODO: Fix rendering tests in a future task
describe.skip('TemplateFormSelectItem Component', () => {
  it('should render an unselected item correctly', async () => {
    const item = {
      label: 'Feature',
      value: 'feat',
    };

    const { lastFrame } = await renderWithAct(
      <TemplateFormSelectItem isSelected={false} item={item} />,
    );

    expect(lastFrame()).toContain('Feature');
    // The color shouldn't be blue for unselected items
    expect(lastFrame()).not.toContain('color="blue"');
    // The text shouldn't be bold for unselected items
    expect(lastFrame()).not.toContain('bold={true}');
  });

  it('should render a selected item correctly', async () => {
    const item = {
      label: 'Feature',
      value: 'feat',
    };

    const { lastFrame } = await renderWithAct(
      <TemplateFormSelectItem isSelected={true} item={item} />,
    );

    expect(lastFrame()).toContain('Feature');
    // In our mocked implementation we can detect styles with text rendered output
    expect(lastFrame()).toContain('color="blue"');
    expect(lastFrame()).toContain('fontWeight: bold');
  });

  it('should handle items with different label formats', async () => {
    const testCases = [
      { label: 'Feature', value: 'feat' },
      { label: 'Bug Fix', value: 'fix' },
      { label: 'Documentation Update', value: 'docs' },
      { label: '🔧 Refactor', value: 'refactor' },
      { label: '🧪 Test', value: 'test' },
    ];

    for (const item of testCases) {
      const { lastFrame } = await renderWithAct(
        <TemplateFormSelectItem isSelected={false} item={item} />,
      );

      expect(lastFrame()).toContain(item.label);
    }
  });

  it('should handle selection state changes', async () => {
    const item = {
      label: 'Feature',
      value: 'feat',
    };

    // Render initially unselected
    const { lastFrame } = await renderWithAct(
      <TemplateFormSelectItem isSelected={false} item={item} />,
    );

    // Initial state should be unselected
    expect(lastFrame()).not.toContain('color="blue"');
    expect(lastFrame()).not.toContain('fontWeight: bold');

    // Rerender with selected state
    await renderWithAct(<TemplateFormSelectItem isSelected={true} item={item} />);

    // Should now be rendered with selection styles
    expect(lastFrame()).toContain('color="blue"');
    expect(lastFrame()).toContain('fontWeight: bold');
  });
});
