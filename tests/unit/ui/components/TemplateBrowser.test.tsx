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
  const React = require('react');
  return function Spinner() {
    return React.createElement('span', null, 'Loading...');
  };
});

// Mock useInput hook from ink
jest.mock('ink', () => ({
  ...jest.requireActual('ink'),
  useInput: jest.fn(() => {
    // No-op mock implementation
  }),
}));

// TODO: These tests will be fixed in task 3.1.4
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
      return Promise.resolve(template);
    }),
  };

  it('should render the loading state', async () => {
    let renderer: any;
    await act(async () => {
      renderer = render(<TemplateBrowser loading={true} onTemplateComplete={() => {}} />);
    });

    expect(renderer.lastFrame()).toContain('Loading templates');
  });

  it('should render a message when no templates are available', async () => {
    const emptyTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockResolvedValue([]),
    };

    // We need to use act to wait for async effects
    let renderer: any;
    await act(async () => {
      renderer = render(
        <TemplateBrowser
          loading={false}
          templateManager={emptyTemplateManager}
          onTemplateComplete={() => {}}
        />,
      );

      // Wait for useEffect to run
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(renderer.lastFrame()).toContain('No templates found');
  });

  it('should render template selector initially', async () => {
    let renderer: any;
    await act(async () => {
      renderer = render(
        <TemplateBrowser
          loading={false}
          templateManager={mockTemplateManager}
          onTemplateComplete={() => {}}
        />,
      );

      // Wait for useEffect and promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Should show template selector after templates are loaded
    expect(renderer.lastFrame()).toContain('Template Selector');
  });

  it('should call onTemplateComplete with the formatted message', async () => {
    const onTemplateComplete = jest.fn();
    const filledValues = {
      type: 'feat',
      description: 'add new feature',
    };

    let renderer: any;
    await act(async () => {
      renderer = render(
        <TemplateBrowser
          loading={false}
          templateManager={mockTemplateManager}
          initialTemplate="Conventional"
          initialValues={filledValues}
          onTemplateComplete={onTemplateComplete}
        />,
      );

      // Wait for useEffect and promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After loading we should see the form because initialTemplate is specified
    expect(renderer.lastFrame()).toContain('Template Form for Conventional');

    // Trigger form submission by clicking the mocked form component
    const formElement = renderer.findByTestId('template-form');
    if (formElement) {
      formElement.click();
    }

    // The onTemplateComplete should have been called
    expect(onTemplateComplete).toHaveBeenCalledWith('feat: add new feature');
  });

  it('should handle cancellation', async () => {
    const onCancel = jest.fn();
    const useInputMock = require('ink').useInput;

    let renderer: any;
    await act(async () => {
      renderer = render(
        <TemplateBrowser
          loading={false}
          templateManager={mockTemplateManager}
          onTemplateComplete={() => {}}
          onCancel={onCancel}
        />,
      );

      // Wait for useEffect and promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Get the last callback that was registered with useInput
    const lastCallback = useInputMock.mock.calls[useInputMock.mock.calls.length - 1][0];

    // Simulate pressing escape
    lastCallback('', { escape: true });

    // The onCancel should have been called
    expect(onCancel).toHaveBeenCalled();
  });

  it('should handle errors loading templates', async () => {
    const errorTemplateManager: TemplateManager = {
      ...mockTemplateManager,
      getAllTemplates: jest.fn().mockRejectedValue(new Error('Failed to load templates')),
    };

    let renderer: any;
    await act(async () => {
      renderer = render(
        <TemplateBrowser
          loading={false}
          templateManager={errorTemplateManager}
          onTemplateComplete={() => {}}
        />,
      );

      // Wait for useEffect and promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Should show error message after failing to load templates
    expect(renderer.lastFrame()).toContain('Failed to load templates');
  });
});
