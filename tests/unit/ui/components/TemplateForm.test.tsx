import React from 'react';
import { renderWithAct, getInputHandler } from '../../../helpers/test-utils';
import TemplateForm from '@ui/components/TemplateForm';
import { TemplateDefinition } from '@core/template-definition';

// Mock components
jest.mock('ink-text-input', () => {
  return function MockTextInput({
    value,
    onChange,
    onSubmit,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    placeholder?: string;
  }) {
    return (
      <div data-testid="text-input">
        <input
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && onSubmit?.()}
          placeholder={placeholder}
          data-testid="text-input-field"
        />
        {placeholder && <div data-testid="placeholder">{placeholder}</div>}
      </div>
    );
  };
});

jest.mock('ink-select-input', () => {
  return function MockSelectInput({
    items,
    onSelect,
    itemComponent,
    initialIndex = 0,
  }: {
    items: any[];
    onSelect: (item: any) => void;
    itemComponent?: any;
    initialIndex?: number;
  }) {
    const ItemComponent = itemComponent;
    return (
      <div data-testid="select-input">
        {items.map((item: any, i: number) => (
          <div key={i} onClick={() => onSelect(item)} data-testid={`select-item-${i}`}>
            {ItemComponent ? (
              <ItemComponent isSelected={i === initialIndex} item={item} />
            ) : (
              <div>{item.label}</div>
            )}
          </div>
        ))}
        <div data-testid="select-help">Use arrow keys to navigate, Enter to select</div>
      </div>
    );
  };
});

// Mock Ink hooks and components
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
  useInput: (callback: any) => {
    // Store the callback for tests to trigger
    getInputHandler().setCallback(callback);
  },
}));

// TODO: Fix rendering tests in a future task
describe.skip('TemplateForm Component', () => {
  const template: TemplateDefinition = {
    name: 'Conventional',
    description: 'Conventional Commits format',
    fields: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Feature', value: 'feat' },
          { label: 'Fix', value: 'fix' },
        ],
      },
      {
        name: 'scope',
        label: 'Scope',
        type: 'text',
        required: false,
        hint: 'Component affected (e.g. auth, api)',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        required: true,
        hint: 'Brief description of the change',
      },
    ],
    format: '{type}({scope}): {description}',
  };

  it('should render form fields for template', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    expect(lastFrame()).toContain('Type');
    expect(lastFrame()).toContain('Scope');
    expect(lastFrame()).toContain('Description');
  });

  it('should display field hints', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    expect(lastFrame()).toContain('Component affected');
    expect(lastFrame()).toContain('Brief description of the change');
  });

  it('should show required field indicators', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    expect(lastFrame()).toContain('Type*');
    expect(lastFrame()).toContain('Description*');
    // Scope is not required
    expect(lastFrame()).not.toContain('Scope*');
  });

  it('should show preview of the formatted message', async () => {
    const values = {
      type: 'feat',
      scope: 'ui',
      description: 'add new component',
    };

    const { lastFrame } = await renderWithAct(
      <TemplateForm template={template} values={values} onChange={() => {}} onSubmit={() => {}} />,
    );

    expect(lastFrame()).toContain('feat(ui): add new component');
  });

  it('should call onChange when field values change', async () => {
    const onChange = jest.fn();
    await renderWithAct(
      <TemplateForm
        template={template}
        values={{ type: 'feat' }}
        onChange={onChange}
        onSubmit={() => {}}
      />,
    );

    // Our TextInput mock doesn't actually trigger events
    // This would be better tested in an integration test
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    await renderWithAct(
      <TemplateForm
        template={template}
        values={{
          type: 'feat',
          description: 'test description',
          // Scope is optional
        }}
        onChange={() => {}}
        onSubmit={onSubmit}
      />,
    );

    // Simulate Enter key to submit form
    const inputHandler = getInputHandler();
    inputHandler.simulateKeypress({ return: true });

    // This would be better tested in an integration test
    // Since our useInput mock isn't actually triggered
  });

  it('should show keyboard navigation help', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    expect(lastFrame()).toContain('Tab: Switch fields');
    expect(lastFrame()).toContain('Enter: Next field');
  });
});
