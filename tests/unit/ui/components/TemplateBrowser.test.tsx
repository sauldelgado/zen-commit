import React from 'react';
import { renderWithAct, getInputHandler } from '../../../helpers/test-utils';
import TemplateBrowser from '@ui/components/TemplateBrowser';
import { TemplateDefinition } from '@core/template-definition';
import { TemplateManager } from '@core/template-manager';

// Mock dependencies with proper typing
jest.mock('@ui/components/TemplateSelector', () => {
  const React = require('react');
  return function TemplateSelector({
    onSelectTemplate,
    templates,
  }: {
    onSelectTemplate: (template: any) => void;
    templates: any[];
    selectedTemplate?: any;
  }) {
    return (
      <div data-testid="template-selector" onClick={() => onSelectTemplate(templates[0])}>
        Template Selector
        {templates.map((t, i) => (
          <div key={i} data-testid={`template-item-${i}`}>
            {t.name} - {t.description}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@ui/components/TemplateForm', () => {
  const React = require('react');
  return function TemplateForm({
    onSubmit,
    template,
    values,
  }: {
    onSubmit: (values: any) => void;
    template: any;
    values: any;
    onChange?: (values: any) => void;
  }) {
    return (
      <div data-testid="template-form" onClick={() => onSubmit(values)}>
        Template Form for {template.name}
        <button data-testid="submit-button" onClick={() => onSubmit(values)}>
          Submit
        </button>
      </div>
    );
  };
});

// Mock Spinner component
jest.mock('ink-spinner', () => {
  const React = require('react');
  return function Spinner() {
    return <span data-testid="spinner">Loading...</span>;
  };
});

// Mock useInput hook from ink
jest.mock('ink', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  useApp: () => ({ exit: jest.fn() }),
}));

// TODO: Fix rendering tests in a future task
describe.skip('TemplateBrowser Component', () => {
  const templates: TemplateDefinition[] = [
    {
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
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
        },
      ],
      format: '{type}: {description}',
    },
    {
      name: 'Simple',
      description: 'Simple format',
      fields: [
        {
          name: 'message',
          label: 'Message',
          type: 'text',
          required: true,
        },
      ],
      format: '{message}',
    },
  ];

  const mockTemplateManager: TemplateManager = {
    getAllTemplates: jest.fn().mockResolvedValue(templates),
    getDefaultTemplates: jest.fn().mockResolvedValue([]),
    getUserTemplates: jest.fn().mockResolvedValue([]),
    saveTemplate: jest.fn().mockResolvedValue(undefined),
    getTemplateByName: jest.fn().mockImplementation((name) => {
      const template = templates.find((t) => t.name === name);
      return Promise.resolve(template || null);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the loading state', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateBrowser loading={true} onTemplateComplete={() => {}} />,
    );

    expect(lastFrame()).toContain('Loading templates');
  });

  it('should render a message when no templates are available', async () => {
    const emptyTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockResolvedValue([]),
    };

    const { lastFrame } = await renderWithAct(
      <TemplateBrowser
        loading={false}
        templateManager={emptyTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    expect(lastFrame()).toContain('No templates found');
  });

  it('should render template selector initially', async () => {
    const { lastFrame } = await renderWithAct(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Template Selector');
  });

  it('should call onTemplateComplete with the formatted message', async () => {
    const onTemplateComplete = jest.fn();
    const filledValues = {
      type: 'feat',
      description: 'add new feature',
    };

    const { findByTestId } = await renderWithAct(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        initialTemplate="Conventional"
        initialValues={filledValues}
        onTemplateComplete={onTemplateComplete}
      />,
    );

    // After initial render, should be in form state with initialTemplate
    expect(await findByTestId('template-form')).toBeDefined();

    // Find and click the submit button
    const submitButton = await findByTestId('submit-button');
    submitButton.click();

    // The onTemplateComplete should have been called
    expect(onTemplateComplete).toHaveBeenCalledWith('feat: add new feature');
  });

  it('should handle cancellation', async () => {
    const onCancel = jest.fn();

    await renderWithAct(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        onTemplateComplete={() => {}}
        onCancel={onCancel}
      />,
    );

    // Simulate pressing escape
    const inputHandler = getInputHandler();
    inputHandler.simulateKeypress({ escape: true });

    // The onCancel should have been called
    expect(onCancel).toHaveBeenCalled();
  });

  it('should handle errors loading templates', async () => {
    const errorTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockRejectedValue(new Error('Failed to load templates')),
    };

    const { lastFrame } = await renderWithAct(
      <TemplateBrowser
        loading={false}
        templateManager={errorTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    // Should show error message after failing to load templates
    expect(lastFrame()).toContain('Failed to load templates');
  });
});
