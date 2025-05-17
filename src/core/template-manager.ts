import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { TemplateDefinition, parseTemplate } from './template-definition';

/**
 * Options for creating a template manager
 */
export interface TemplateManagerOptions {
  /** Directory for user-defined templates */
  userTemplatesDir: string;
  /** Directory for built-in templates */
  builtInTemplatesDir: string;
}

/**
 * Interface for template manager
 */
export interface TemplateManager {
  /**
   * Gets built-in default templates
   * @returns Promise resolving to an array of template definitions
   */
  getDefaultTemplates(): Promise<TemplateDefinition[]>;

  /**
   * Gets user-defined templates
   * @returns Promise resolving to an array of template definitions
   */
  getUserTemplates(): Promise<TemplateDefinition[]>;

  /**
   * Gets all templates (both default and user-defined)
   * @returns Promise resolving to an array of template definitions
   */
  getAllTemplates(): Promise<TemplateDefinition[]>;

  /**
   * Saves a template to the user templates directory
   * @param name Name to use for the template file
   * @param template Template definition to save
   * @returns Promise that resolves when the template is saved
   */
  saveTemplate(name: string, template: TemplateDefinition): Promise<void>;

  /**
   * Gets a template by its name
   * @param name Name of the template to find
   * @returns Promise resolving to the matching template, or undefined if not found
   */
  getTemplateByName(name: string): Promise<TemplateDefinition | undefined>;
}

/**
 * Factory function to create a template manager
 * @param options Configuration options for the template manager
 * @returns A template manager instance
 */
export function createTemplateManager(options: TemplateManagerOptions): TemplateManager {
  return {
    /**
     * Get built-in default templates
     */
    async getDefaultTemplates(): Promise<TemplateDefinition[]> {
      try {
        if (!fs.existsSync(options.builtInTemplatesDir)) {
          return [];
        }

        const files = await fs.promises.readdir(options.builtInTemplatesDir);
        const templates: TemplateDefinition[] = [];

        for (const file of files) {
          if (path.extname(file) === '.yaml' || path.extname(file) === '.yml') {
            const filePath = path.join(options.builtInTemplatesDir, file);
            const content = await fs.promises.readFile(filePath, 'utf8');

            try {
              const template = parseTemplate(content);
              templates.push(template);
            } catch (error) {
              console.error(`Error parsing template ${file}:`, error);
            }
          }
        }

        return templates;
      } catch (error) {
        console.error('Error loading default templates:', error);
        return [];
      }
    },

    /**
     * Get user-defined templates
     */
    async getUserTemplates(): Promise<TemplateDefinition[]> {
      try {
        if (!fs.existsSync(options.userTemplatesDir)) {
          return [];
        }

        const files = await fs.promises.readdir(options.userTemplatesDir);
        const templates: TemplateDefinition[] = [];

        for (const file of files) {
          if (path.extname(file) === '.yaml' || path.extname(file) === '.yml') {
            const filePath = path.join(options.userTemplatesDir, file);
            const content = await fs.promises.readFile(filePath, 'utf8');

            try {
              const template = parseTemplate(content);
              templates.push(template);
            } catch (error) {
              console.error(`Error parsing user template ${file}:`, error);
            }
          }
        }

        return templates;
      } catch (error) {
        console.error('Error loading user templates:', error);
        return [];
      }
    },

    /**
     * Get all templates (both default and user-defined)
     * User templates with the same name override default templates
     */
    async getAllTemplates(): Promise<TemplateDefinition[]> {
      const defaultTemplates = await this.getDefaultTemplates();
      const userTemplates = await this.getUserTemplates();

      // Create a map to deduplicate templates with the same name
      // User templates take precedence over default templates
      const templateMap = new Map<string, TemplateDefinition>();

      // Add default templates first
      for (const template of defaultTemplates) {
        templateMap.set(template.name.toLowerCase(), template);
      }

      // Add user templates, overriding any default templates with the same name
      for (const template of userTemplates) {
        templateMap.set(template.name.toLowerCase(), template);
      }

      // Convert map back to array
      return Array.from(templateMap.values());
    },

    /**
     * Save a template to the user templates directory
     */
    async saveTemplate(name: string, template: TemplateDefinition): Promise<void> {
      try {
        // Create the directory if it doesn't exist
        await fs.promises.mkdir(options.userTemplatesDir, { recursive: true });

        // Convert template to YAML
        const content = yaml.dump(template);

        // Normalize the name and append .yaml extension
        const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.yaml`;
        const filePath = path.join(options.userTemplatesDir, fileName);

        // Write the file
        await fs.promises.writeFile(filePath, content, 'utf8');
      } catch (error) {
        throw new Error(`Failed to save template: ${(error as Error).message}`);
      }
    },

    /**
     * Get a template by name (case-insensitive)
     */
    async getTemplateByName(name: string): Promise<TemplateDefinition | undefined> {
      const templates = await this.getAllTemplates();
      return templates.find((template) => template.name.toLowerCase() === name.toLowerCase());
    },
  };
}
