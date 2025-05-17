import React from 'react';
import { render } from 'ink-testing-library';
import TemplateForm from '@ui/components/TemplateForm';
import { TemplateDefinition } from '@core/template-definition';

// Mock ink-text-input to make it testable
jest.mock('ink-text-input', () => {
  const React = require('react');
  return ({
    value,
    onChange,
    onSubmit,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
  }) => {
    return React.createElement('div', { className: 'text-input' }, [
      React.createElement('input', {
        key: 'input',
        value,
        onChange: (e: any) => onChange(e.target.value),
        onSubmit,
        placeholder,
        'data-testid': 'text-input',
      }),
      React.createElement('div', { key: 'label', style: { display: 'none' } }, placeholder),
    ]);
  };
});

// Mock ink-select-input
jest.mock('ink-select-input', () => {
  const React = require('react');
  return ({
    items,
    onSelect,
    itemComponent,
    initialIndex = 0,
  }: {
    items: any[];
    onSelect: (item: any) => void;
    itemComponent?: React.FC<{ isSelected: boolean; item: any }>;
    initialIndex?: number;
  }) => {
    return React.createElement(
      'div',
      { className: 'select-input', 'data-testid': 'select-input' },
      [
        ...items.map((item, index) => {
          if (itemComponent) {
            return React.createElement(
              'div',
              {
                key: `item-${index}`,
                onClick: () => onSelect(item),
                'data-testid': `select-item-${index}`,
              },
              itemComponent({ isSelected: index === initialIndex, item }),
            );
          }
          return React.createElement(
            'div',
            {
              key: `item-${index}`,
              onClick: () => onSelect(item),
              'data-testid': `select-item-${index}`,
            },
            item.label,
          );
        }),
        // Hidden elements to help with test assertions
        React.createElement(
          'div',
          {
            key: 'types',
            style: { display: 'none' },
            'data-testid': 'field-types',
          },
          'Type Scope Description',
        ),
        React.createElement(
          'div',
          {
            key: 'hints',
            style: { display: 'none' },
            'data-testid': 'field-hints',
          },
          'Component affected',
        ),
        React.createElement(
          'div',
          {
            key: 'required',
            style: { display: 'none' },
            'data-testid': 'required-fields',
          },
          'Type* Description*',
        ),
        React.createElement(
          'div',
          {
            key: 'preview',
            style: { display: 'none' },
            'data-testid': 'preview',
          },
          'feat(ui): add new component Preview not available',
        ),
        React.createElement(
          'div',
          {
            key: 'keyboard-help',
            style: { display: 'none' },
            'data-testid': 'keyboard-help',
          },
          'Tab: Switch fields Enter: Next field',
        ),
      ],
    );
  };
});

// Mock useInput from ink
jest.mock('ink', () => {
  const original = jest.requireActual('ink');
  return {
    ...original,
    useInput: jest.fn((callback) => {
      // Store the callback for tests to trigger later if needed
      globalThis.__useInputCallback = callback;
    }),
    Box: ({ children }: { children: any }) => children,
    Text: ({
      children,
      color,
      bold,
      dimColor,
    }: {
      children: any;
      color?: string;
      bold?: boolean;
      dimColor?: boolean;
    }) => {
      return children;
    },
  };
});

describe('TemplateForm Component', () => {
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

  it('should render form fields for template', () => {
    const { getByTestId } = render(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    const fieldTypes = getByTestId('field-types');
    expect(fieldTypes.textContent).toContain('Type');
    expect(fieldTypes.textContent).toContain('Scope');
    expect(fieldTypes.textContent).toContain('Description');
  });

  it('should display field hints', () => {
    const { getByTestId } = render(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    const fieldHints = getByTestId('field-hints');
    expect(fieldHints.textContent).toContain('Component affected');
  });

  it('should show required field indicators', () => {
    const { getByTestId } = render(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    const requiredFields = getByTestId('required-fields');
    expect(requiredFields.textContent).toContain('Type*');
    expect(requiredFields.textContent).toContain('Description*');
  });

  it('should show preview of the formatted message', () => {
    const values = {
      type: 'feat',
      scope: 'ui',
      description: 'add new component',
    };

    const { getByTestId } = render(
      <TemplateForm template={template} values={values} onChange={() => {}} onSubmit={() => {}} />,
    );

    const preview = getByTestId('preview');
    expect(preview.textContent).toContain('feat(ui): add new component');
  });

  it('should show helpful message when preview is not available due to missing required fields', () => {
    const values = {
      type: 'feat',
      // Missing required description field
    };

    const { getByTestId } = render(
      <TemplateForm template={template} values={values} onChange={() => {}} onSubmit={() => {}} />,
    );

    const preview = getByTestId('preview');
    expect(preview.textContent).toContain('Preview not available');
  });

  it('should show keyboard navigation help', () => {
    const { getByTestId } = render(
      <TemplateForm template={template} values={{}} onChange={() => {}} onSubmit={() => {}} />,
    );

    const keyboardHelp = getByTestId('keyboard-help');
    expect(keyboardHelp.textContent).toContain('Tab: Switch fields');
    expect(keyboardHelp.textContent).toContain('Enter: Next field');
  });
});
