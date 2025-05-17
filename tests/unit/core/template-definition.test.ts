import {
  parseTemplate,
  validateTemplate,
  applyTemplate,
  TemplateDefinition,
} from '@core/template-definition';

describe('Custom Template Definition', () => {
  describe('parseTemplate', () => {
    it('should parse a valid template definition', () => {
      const template = `
        name: Ticket-based Commit
        description: A commit message template for ticket-based workflows
        fields:
          - name: ticket
            label: Ticket Number
            type: text
            required: true
            pattern: '[A-Z]+-\\d+'
            hint: Enter the ticket number (e.g., JIRA-123)
            
          - name: type
            label: Change Type
            type: select
            required: true
            options:
              - label: Feature
                value: feat
              - label: Bug Fix
                value: fix
              - label: Documentation
                value: docs
            
          - name: description
            label: Description
            type: text
            required: true
            hint: Brief description of the changes
            
        format: '{ticket}: {type}: {description}'
      `;

      const parsed = parseTemplate(template);

      expect(parsed.name).toBe('Ticket-based Commit');
      expect(parsed.description).toBe('A commit message template for ticket-based workflows');
      expect(parsed.fields.length).toBe(3);
      expect(parsed.fields[0].name).toBe('ticket');
      expect(parsed.fields[0].pattern).toBe('[A-Z]+-\\d+');
      expect(parsed.fields[1].options?.length).toBe(3);
      expect(parsed.format).toBe('{ticket}: {type}: {description}');
    });

    it('should throw error for invalid template format', () => {
      const template = `
        name: Invalid Template
        description: Missing required fields
      `;

      expect(() => parseTemplate(template)).toThrow();
    });

    it('should parse template with optional formats', () => {
      const template = `
        name: Template with Optional Formats
        description: A template with alternative formats for optional fields
        fields:
          - name: type
            label: Type
            type: select
            required: true
            options:
              - label: Feature
                value: feat
              - label: Fix
                value: fix
          
          - name: scope
            label: Scope
            type: text
            required: false
          
          - name: description
            label: Description
            type: text
            required: true
            
        format: '{type}({scope}): {description}'
        optionalFormat:
          scope: '{type}: {description}'
      `;

      const parsed = parseTemplate(template);

      expect(parsed.name).toBe('Template with Optional Formats');
      expect(parsed.optionalFormat).toBeDefined();
      expect(parsed.optionalFormat?.scope).toBe('{type}: {description}');
    });
  });

  describe('validateTemplate', () => {
    it('should validate a valid template', () => {
      const template: TemplateDefinition = {
        name: 'Simple Template',
        description: 'A simple template',
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
      };

      const validation = validateTemplate(template);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should reject template with invalid field references in format', () => {
      const template: TemplateDefinition = {
        name: 'Invalid Template',
        description: 'A template with invalid field references',
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
        ],
        format: '{type}: {description}', // 'description' field doesn't exist
      };

      const validation = validateTemplate(template);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Format references non-existent field: description');
    });

    it('should reject template with empty options for select field', () => {
      const template: TemplateDefinition = {
        name: 'Invalid Template',
        description: 'An invalid template',
        fields: [
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [], // Empty options is invalid
          },
        ],
        format: '{type}',
      };

      const validation = validateTemplate(template);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Select field type has no options');
    });

    it('should warn about templates without descriptions', () => {
      const template: TemplateDefinition = {
        name: 'No Description Template',
        description: '',
        fields: [
          {
            name: 'message',
            label: 'Message',
            type: 'text',
            required: true,
          },
        ],
        format: '{message}',
      };

      const validation = validateTemplate(template);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Template has no description');
    });

    it('should reject template with invalid regex pattern', () => {
      const template: TemplateDefinition = {
        name: 'Invalid Regex Pattern',
        description: 'A template with invalid regex pattern',
        fields: [
          {
            name: 'field',
            label: 'Field',
            type: 'text',
            required: true,
            pattern: '[', // Invalid regex pattern
          },
        ],
        format: '{field}',
      };

      const validation = validateTemplate(template);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Field field has invalid regex pattern: [');
    });
  });

  describe('applyTemplate', () => {
    it('should apply template to field values', () => {
      const template: TemplateDefinition = {
        name: 'Simple Template',
        description: 'A simple template',
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
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            required: true,
          },
        ],
        format: '{type}({scope}): {description}',
      };

      const values = {
        type: 'feat',
        scope: 'ui',
        description: 'add new button',
      };

      const result = applyTemplate(template, values);
      expect(result).toBe('feat(ui): add new button');
    });

    it('should handle optional fields with optionalFormat', () => {
      const template: TemplateDefinition = {
        name: 'Simple Template',
        description: 'A simple template',
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
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            required: true,
          },
        ],
        format: '{type}({scope}): {description}',
        optionalFormat: {
          scope: '{type}: {description}',
        },
      };

      const values = {
        type: 'feat',
        description: 'add new button',
      };

      const result = applyTemplate(template, values);
      expect(result).toBe('feat: add new button');
    });

    it('should throw error if required field is missing', () => {
      const template: TemplateDefinition = {
        name: 'Required Fields Template',
        description: 'A template with required fields',
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
      };

      const values = {
        type: 'feat',
        // Missing required description field
      };

      expect(() => applyTemplate(template, values)).toThrow('Missing required field: description');
    });

    it('should replace missing optional fields with empty strings', () => {
      const template: TemplateDefinition = {
        name: 'Template with Optional Field',
        description: 'A template with an optional field',
        fields: [
          {
            name: 'prefix',
            label: 'Prefix',
            type: 'text',
            required: false,
          },
          {
            name: 'message',
            label: 'Message',
            type: 'text',
            required: true,
          },
        ],
        format: '{prefix} {message}',
      };

      const values = {
        message: 'this is a message',
        // Prefix is omitted
      };

      const result = applyTemplate(template, values);
      expect(result).toBe(' this is a message');
    });
  });
});
