import * as yaml from 'js-yaml';

/**
 * Interface for a template field option (used for select fields)
 */
export interface TemplateFieldOption {
  /** Display label for the option */
  label: string;
  /** Value to be used when this option is selected */
  value: string;
}

/**
 * Interface for a template field definition
 */
export interface TemplateField {
  /** Unique name/identifier for the field */
  name: string;
  /** Display label for the field */
  label: string;
  /** Type of field input */
  type: 'text' | 'select' | 'multiline';
  /** Whether the field is required */
  required: boolean;
  /** Optional regex pattern for validation */
  pattern?: string;
  /** Optional hint text to display to the user */
  hint?: string;
  /** Options for select-type fields */
  options?: TemplateFieldOption[];
  /** Optional default value */
  default?: string;
}

/**
 * Interface for a complete template definition
 */
export interface TemplateDefinition {
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Array of field definitions */
  fields: TemplateField[];
  /** Format string that uses {fieldName} placeholders */
  format: string;
  /** Optional alternative formats when specific fields are not provided */
  optionalFormat?: Record<string, string>;
}

/**
 * Interface for template validation result
 */
export interface TemplateValidationResult {
  /** Whether the template is valid */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

/**
 * Parse a YAML template definition into a TemplateDefinition object
 * @param yamlContent YAML string containing template definition
 * @returns Parsed template definition
 * @throws Error if the template is invalid or cannot be parsed
 */
export function parseTemplate(yamlContent: string): TemplateDefinition {
  try {
    const parsed = yaml.load(yamlContent) as Record<string, any>;

    // Validate required fields
    if (!parsed.name) {
      throw new Error('Template must have a name');
    }

    if (!parsed.fields || !Array.isArray(parsed.fields)) {
      throw new Error('Template must have fields array');
    }

    if (!parsed.format) {
      throw new Error('Template must have a format string');
    }

    // Create the template definition
    const template: TemplateDefinition = {
      name: parsed.name,
      description: parsed.description || '',
      fields: parsed.fields.map((field: Record<string, any>) => ({
        name: field.name,
        label: field.label || field.name,
        type: field.type || 'text',
        required: field.required !== false,
        pattern: field.pattern,
        hint: field.hint,
        options: field.options,
        default: field.default,
      })),
      format: parsed.format,
      optionalFormat: parsed.optionalFormat,
    };

    return template;
  } catch (error) {
    throw new Error(`Failed to parse template: ${(error as Error).message}`);
  }
}

/**
 * Validate a template definition
 * @param template Template definition to validate
 * @returns Validation result
 */
export function validateTemplate(template: TemplateDefinition): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all field names are unique
  const fieldNames = new Set<string>();
  for (const field of template.fields) {
    if (fieldNames.has(field.name)) {
      errors.push(`Duplicate field name: ${field.name}`);
    }
    fieldNames.add(field.name);
  }

  // Check that all fields referenced in format exist
  const formatRegex = /\{([a-zA-Z0-9_]+)\}/g;
  let match;
  const formatString = template.format;

  // Reset regex state by creating a new regex object
  const formatRegexCopy = new RegExp(formatRegex);
  while ((match = formatRegexCopy.exec(formatString)) !== null) {
    const fieldName = match[1];
    if (!fieldNames.has(fieldName)) {
      errors.push(`Format references non-existent field: ${fieldName}`);
    }
  }

  // Check optional formats if they exist
  if (template.optionalFormat) {
    for (const [fieldName, format] of Object.entries(template.optionalFormat)) {
      // Check that the field actually exists
      if (!fieldNames.has(fieldName)) {
        errors.push(`Optional format references non-existent field: ${fieldName}`);
        continue;
      }

      // Check that all fields referenced in this format exist
      const optionalFormatRegex = new RegExp(formatRegex);
      let optMatch;
      while ((optMatch = optionalFormatRegex.exec(format)) !== null) {
        const referencedField = optMatch[1];
        if (!fieldNames.has(referencedField)) {
          errors.push(
            `Optional format for ${fieldName} references non-existent field: ${referencedField}`,
          );
        }
      }
    }
  }

  // Check select fields have options
  for (const field of template.fields) {
    if (field.type === 'select') {
      if (!field.options || field.options.length === 0) {
        errors.push(`Select field ${field.name} has no options`);
      }
    }
  }

  // Check patterns are valid regex
  for (const field of template.fields) {
    if (field.pattern) {
      try {
        new RegExp(field.pattern);
      } catch (error) {
        errors.push(`Field ${field.name} has invalid regex pattern: ${field.pattern}`);
      }
    }
  }

  // Include warnings for best practices
  if (!template.description) {
    warnings.push('Template has no description');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Apply a template to field values
 * @param template Template definition
 * @param values Object containing field values
 * @returns Formatted string
 * @throws Error if required fields are missing
 */
export function applyTemplate(
  template: TemplateDefinition,
  values: Record<string, string>,
): string {
  // Check for missing required fields
  for (const field of template.fields) {
    if (field.required && !values[field.name]) {
      throw new Error(`Missing required field: ${field.name}`);
    }
  }

  // Determine which format to use based on optional fields
  let formatString = template.format;

  // Check if we need to use an optional format because a field is missing
  if (template.optionalFormat) {
    for (const [fieldName, format] of Object.entries(template.optionalFormat)) {
      // If this field is missing, use its optional format
      if (!values[fieldName]) {
        formatString = format;
        break;
      }
    }
  }

  // Replace field placeholders with values
  return formatString.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, fieldName) => {
    return values[fieldName] || '';
  });
}
