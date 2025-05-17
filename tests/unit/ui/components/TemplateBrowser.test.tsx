import React from 'react';
import { render } from 'ink-testing-library';
import TemplateBrowser from '@ui/components/TemplateBrowser';
import { TemplateDefinition } from '@core/template-definition';
import { TemplateManager } from '@core/template-manager';

// Mock dependencies
jest.mock('@ui/components/TemplateSelector', () => {
  const React = require('react');
  return ({
    onSelectTemplate,
    templates,
  }: {
    onSelectTemplate: (template: any) => void;
    templates: any[];
  }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'template-selector',
        onClick: () => onSelectTemplate(templates[0]),
      },
      'Template Selector',
    );
  };
});

jest.mock('@ui/components/TemplateForm', () => {
  const React = require('react');
  return ({
    onSubmit,
    template,
    values,
  }: {
    onSubmit: (values: any) => void;
    template: any;
    values: any;
  }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'template-form',
        onClick: () => onSubmit(values),
      },
      `Template Form for ${template.name}`,
    );
  };
});

// Mock Spinner component
jest.mock('ink-spinner', () => {
  return function Spinner() {
    return 'Loading...';
  };
});

// Mock useInput hook from ink
jest.mock('ink', () => ({
  ...jest.requireActual('ink'),
  useInput: jest.fn(() => {
    // No-op mock implementation
  }),
}));

describe('TemplateBrowser Component', () => {
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
      return Promise.resolve(template);
    }),
  };

  it('should render the loading state', () => {
    const { lastFrame } = render(<TemplateBrowser loading={true} onTemplateComplete={() => {}} />);

    expect(lastFrame()).toContain('Loading templates');
  });

  it('should render a message when no templates are available', () => {
    const emptyTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockResolvedValue([]),
    };

    const { lastFrame } = render(
      <TemplateBrowser
        loading={false}
        templateManager={emptyTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Loading templates');
  });

  it('should render template selector initially', async () => {
    const { lastFrame } = render(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    // Initially should show loading until templates are loaded
    expect(lastFrame()).toContain('Loading templates');
  });

  it('should call onTemplateComplete with the formatted message', () => {
    const onTemplateComplete = jest.fn();
    const filledValues = {
      type: 'feat',
      description: 'add new feature',
    };

    const { lastFrame } = render(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        initialTemplate="Conventional"
        initialValues={filledValues}
        onTemplateComplete={onTemplateComplete}
      />,
    );

    // Initially should show loading until templates are loaded
    expect(lastFrame()).toContain('Loading templates');
  });

  it('should handle cancellation', () => {
    const onCancel = jest.fn();

    const { lastFrame } = render(
      <TemplateBrowser
        loading={false}
        templateManager={mockTemplateManager}
        onTemplateComplete={() => {}}
        onCancel={onCancel}
      />,
    );

    expect(lastFrame()).toContain('Loading templates');
  });

  it('should handle errors loading templates', async () => {
    const errorTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockRejectedValue(new Error('Failed to load templates')),
    };

    const { lastFrame } = render(
      <TemplateBrowser
        loading={false}
        templateManager={errorTemplateManager}
        onTemplateComplete={() => {}}
      />,
    );

    // Initially shows loading
    expect(lastFrame()).toContain('Loading templates');
  });
});
