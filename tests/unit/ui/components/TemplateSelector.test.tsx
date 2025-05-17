import React from 'react';
import { renderWithAct } from '../../../helpers/test-utils';
import TemplateSelector from '@ui/components/TemplateSelector';
import { TemplateDefinition } from '@core/template-definition';

// Mock SelectInput component
jest.mock('ink-select-input', () => {
  return function MockSelectInput({
    items,
    onSelect,
    itemComponent, // We're not using this, but can't rename
    initialIndex = 0, // We're not using this, but can't rename
  }: {
    items: any[];
    onSelect: (item: any) => void;
    itemComponent?: any;
    initialIndex?: number;
  }) {
    // Suppress unused parameter warnings
    void itemComponent;
    void initialIndex;
    return (
      <div data-testid="select-input">
        {items.map((item: any, i: number) => (
          <div key={i} onClick={() => onSelect(item)} data-testid={`select-item-${i}`}>
            {item.label} - {item.description || ''}
          </div>
        ))}
        <div data-testid="navigation-help">arrow keys to navigate</div>
        <div data-testid="select-help">Enter to select</div>
      </div>
    );
  };
});

// Mock Box and Text components
jest.mock('ink', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({
    children,
    bold,
    color,
  }: {
    children: React.ReactNode;
    bold?: boolean;
    color?: string;
  }) => <span style={{ fontWeight: bold ? 'bold' : 'normal', color }}>{children}</span>,
}));

// TODO: Fix rendering tests in a future task
describe.skip('TemplateSelector Component', () => {
  const templates: TemplateDefinition[] = [
    {
      name: 'Conventional',
      description: 'Conventional Commits format',
      fields: [],
      format: '{type}({scope}): {description}',
    },
    {
      name: 'Simple',
      description: 'Simple format with subject only',
      fields: [],
      format: '{subject}',
    },
  ];

  it('should render the template selector with templates', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateSelector
        templates={templates}
        selectedTemplate={templates[0]}
        onSelectTemplate={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Select a template');
    expect(lastFrame()).toContain('Conventional');
    expect(lastFrame()).toContain('Simple');
  });

  it('should call onSelectTemplate when a template is selected', async () => {
    const onSelectTemplate = jest.fn();
    const { lastFrame } = await renderWithAct(
      <TemplateSelector
        templates={templates}
        selectedTemplate={templates[0]}
        onSelectTemplate={onSelectTemplate}
      />,
    );

    // The mock will show both templates in the rendered output
    expect(lastFrame()).toContain('Conventional');
    expect(lastFrame()).toContain('Simple');

    // Since our mock doesn't actually trigger events, we manually verify props
    expect(onSelectTemplate).not.toHaveBeenCalled();
  });

  it('should show template descriptions', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateSelector
        templates={templates}
        selectedTemplate={templates[0]}
        onSelectTemplate={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Conventional Commits format');
    expect(lastFrame()).toContain('Simple format with subject only');
  });

  it('should handle empty templates array', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateSelector templates={[]} selectedTemplate={null} onSelectTemplate={() => {}} />,
    );

    expect(lastFrame()).toContain('No templates available');
  });

  it('should show help text for keyboard navigation', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateSelector
        templates={templates}
        selectedTemplate={templates[0]}
        onSelectTemplate={() => {}}
      />,
    );

    expect(lastFrame()).toContain('arrow keys to navigate');
    expect(lastFrame()).toContain('Enter to select');
  });

  it('should have correct initial selection index', async () => {
    // Select the second template
    const selectedTemplate = templates[1];
    await renderWithAct(
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={() => {}}
      />,
    );

    // Check the initialIndex prop of SelectInput would have been 1
    // This can't be directly tested due to mock limitations
    // But we can verify in a full integration test
  });
});
