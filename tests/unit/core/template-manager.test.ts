import { TemplateManager, createTemplateManager } from '@core/template-manager';
import { TemplateDefinition } from '@core/template-definition';
import * as fs from 'fs';

// Mock fs and path
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
  existsSync: jest.fn(),
}));

describe('Template Manager', () => {
  let templateManager: TemplateManager;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    templateManager = createTemplateManager({
      userTemplatesDir: '/user/templates',
      builtInTemplatesDir: '/builtin/templates',
    });
  });

  describe('getDefaultTemplates', () => {
    it('should load built-in templates', async () => {
      // Mock readdir and readFile
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['conventional.yaml', 'simple.yaml']);
      (fs.promises.readFile as jest.Mock).mockImplementation((path) => {
        if (path.includes('conventional.yaml')) {
          return Promise.resolve('name: Conventional\nfields: []\nformat: "{}"');
        }
        if (path.includes('simple.yaml')) {
          return Promise.resolve('name: Simple\nfields: []\nformat: "{}"');
        }
        return Promise.resolve('');
      });

      const templates = await templateManager.getDefaultTemplates();

      expect(templates.length).toBe(2);
      expect(templates[0].name).toBe('Conventional');
      expect(templates[1].name).toBe('Simple');
    });

    it('should handle missing built-in templates directory', async () => {
      // Mock existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const templates = await templateManager.getDefaultTemplates();

      expect(templates.length).toBe(0);
    });

    it('should handle errors in template parsing', async () => {
      // Set up mocks for files with only one valid template
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['valid.yaml']);
      (fs.promises.readFile as jest.Mock).mockImplementation((path) => {
        if (path.includes('valid.yaml')) {
          return Promise.resolve('name: Valid\nfields: []\nformat: "{}"');
        }
        return Promise.resolve('');
      });

      // Mock console.error to avoid test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const templates = await templateManager.getDefaultTemplates();

      // Restore console.error
      console.error = originalConsoleError;

      // Should only return the valid template
      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Valid');
    });
  });

  describe('getUserTemplates', () => {
    it('should load user templates', async () => {
      // Mock readdir and readFile
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['custom.yaml']);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        'name: Custom\nfields: []\nformat: "{}"',
      );

      const templates = await templateManager.getUserTemplates();

      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Custom');
    });

    it('should handle no user templates directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const templates = await templateManager.getUserTemplates();

      expect(templates.length).toBe(0);
    });

    it('should ignore non-YAML files', async () => {
      // Mock readdir with mixed files
      (fs.promises.readdir as jest.Mock).mockResolvedValue([
        'template.yaml',
        'readme.md',
        'template.yml',
        'notes.txt',
      ]);
      (fs.promises.readFile as jest.Mock).mockImplementation((path) => {
        if (path.includes('.yaml') || path.includes('.yml')) {
          return Promise.resolve('name: Template\nfields: []\nformat: "{}"');
        }
        return Promise.resolve('');
      });

      const templates = await templateManager.getUserTemplates();

      // Should only load the .yaml and .yml files
      expect(templates.length).toBe(2);
      // Check that readFile was called twice (for yaml and yml files only)
      expect(fs.promises.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllTemplates', () => {
    it('should return combined default and user templates', async () => {
      // Mock readdir and readFile for default templates
      jest.spyOn(templateManager, 'getDefaultTemplates').mockResolvedValue([
        {
          name: 'Conventional',
          description: 'Conventional format',
          fields: [],
          format: '{}',
        },
      ]);

      jest.spyOn(templateManager, 'getUserTemplates').mockResolvedValue([
        {
          name: 'Custom',
          description: 'Custom format',
          fields: [],
          format: '{}',
        },
      ]);

      const templates = await templateManager.getAllTemplates();

      expect(templates.length).toBe(2);
      expect(templates[0].name).toBe('Conventional');
      expect(templates[1].name).toBe('Custom');
    });

    it('should deduplicate templates with the same name (user templates take precedence)', async () => {
      // Mock templates with the same name
      jest.spyOn(templateManager, 'getDefaultTemplates').mockResolvedValue([
        {
          name: 'Duplicate',
          description: 'Built-in version',
          fields: [],
          format: '{}',
        },
      ]);

      jest.spyOn(templateManager, 'getUserTemplates').mockResolvedValue([
        {
          name: 'Duplicate',
          description: 'User version',
          fields: [],
          format: '{}',
        },
      ]);

      const templates = await templateManager.getAllTemplates();

      // Should only have one template with the user version taking precedence
      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Duplicate');
      expect(templates[0].description).toBe('User version');
    });
  });

  describe('saveTemplate', () => {
    it('should save a template to the user directory', async () => {
      const template: TemplateDefinition = {
        name: 'Test Template',
        description: 'Test description',
        fields: [],
        format: '{}',
      };

      await templateManager.saveTemplate('test', template);

      expect(fs.promises.mkdir).toHaveBeenCalledWith('/user/templates', { recursive: true });
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/user/templates/test.yaml',
        expect.any(String),
        'utf8',
      );
    });

    it('should handle errors when saving template', async () => {
      // Mock writeFile to throw an error
      (fs.promises.writeFile as jest.Mock).mockRejectedValue(new Error('Write error'));

      const template: TemplateDefinition = {
        name: 'Test Template',
        description: 'Test description',
        fields: [],
        format: '{}',
      };

      await expect(templateManager.saveTemplate('test', template)).rejects.toThrow(
        'Failed to save template: Write error',
      );
    });

    it('should normalize the template name for the file name', async () => {
      const template: TemplateDefinition = {
        name: 'Complex Template Name!',
        description: 'Test description',
        fields: [],
        format: '{}',
      };

      // Mock writeFile to succeed for this test
      (fs.promises.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

      await templateManager.saveTemplate('Complex Template Name!', template);

      // Check that the filename is normalized correctly
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/user/templates/complex-template-name-.yaml',
        expect.any(String),
        'utf8',
      );
    });
  });

  describe('getTemplateByName', () => {
    it('should return a template by name', async () => {
      // Set up mocks to return templates
      jest.spyOn(templateManager, 'getAllTemplates').mockResolvedValue([
        {
          name: 'Conventional',
          description: 'Conventional format',
          fields: [],
          format: '{}',
        },
        {
          name: 'Custom',
          description: 'Custom format',
          fields: [],
          format: '{}',
        },
      ]);

      const template = await templateManager.getTemplateByName('Custom');

      expect(template).toBeDefined();
      expect(template?.name).toBe('Custom');
    });

    it('should return undefined for non-existent template', async () => {
      jest.spyOn(templateManager, 'getAllTemplates').mockResolvedValue([]);

      const template = await templateManager.getTemplateByName('NonExistent');

      expect(template).toBeUndefined();
    });

    it('should handle case-insensitive template name search', async () => {
      // Set up mocks to return templates
      jest.spyOn(templateManager, 'getAllTemplates').mockResolvedValue([
        {
          name: 'Conventional',
          description: 'Conventional format',
          fields: [],
          format: '{}',
        },
      ]);

      const template = await templateManager.getTemplateByName('conventional');

      expect(template).toBeDefined();
      expect(template?.name).toBe('Conventional');
    });
  });
});
