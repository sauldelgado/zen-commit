import {
  parseConventionalCommit,
  formatConventionalCommit,
  validateConventionalCommit,
  ConventionalCommit,
} from '@core/conventional-commits';

describe('Conventional Commits', () => {
  describe('parseConventionalCommit', () => {
    it('should parse a valid conventional commit message', () => {
      const message = 'feat(ui): add new button component';
      const parsed = parseConventionalCommit(message);

      expect(parsed).toEqual({
        type: 'feat',
        scope: 'ui',
        description: 'add new button component',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      });
    });

    it('should parse a message without scope', () => {
      const message = 'docs: update README';
      const parsed = parseConventionalCommit(message);

      expect(parsed.type).toBe('docs');
      expect(parsed.scope).toBe('');
      expect(parsed.description).toBe('update README');
      expect(parsed.isValid).toBe(true);
    });

    it('should parse a breaking change with ! marker', () => {
      const message = 'feat(api)!: change response format';
      const parsed = parseConventionalCommit(message);

      expect(parsed.isBreakingChange).toBe(true);
      expect(parsed.type).toBe('feat');
      expect(parsed.description).toBe('change response format');
    });

    it('should handle messages with body and footer', () => {
      const message = `feat(core): implement new feature
      
      This is a detailed description of the new feature
      that spans multiple lines
      
      BREAKING CHANGE: This changes the API
      Reviewed-by: John Doe`;

      const parsed = parseConventionalCommit(message);

      expect(parsed.type).toBe('feat');
      expect(parsed.body).toContain('detailed description');
      expect(parsed.footer).toContain('BREAKING CHANGE');
      expect(parsed.footer).toContain('Reviewed-by');
      expect(parsed.isBreakingChange).toBe(true);
    });

    it('should recognize breaking change in footer', () => {
      const message = `feat(core): implement new feature
      
      This is a description
      
      BREAKING CHANGE: This changes the API`;

      const parsed = parseConventionalCommit(message);

      expect(parsed.isBreakingChange).toBe(true);
      expect(parsed.footer).toContain('BREAKING CHANGE');
    });

    it('should handle multi-paragraph body sections', () => {
      const message = `feat(core): implement new feature
      
      First paragraph of the body.
      
      Second paragraph with more details.
      
      BREAKING CHANGE: This changes the API`;

      const parsed = parseConventionalCommit(message);

      expect(parsed.body).toContain('First paragraph');
      expect(parsed.body).toContain('Second paragraph');
      expect(parsed.footer).toContain('BREAKING CHANGE');
    });

    it('should handle non-conventional commits', () => {
      const message = 'just a regular commit message';
      const parsed = parseConventionalCommit(message);

      expect(parsed.isValid).toBe(false);
    });
  });

  describe('formatConventionalCommit', () => {
    it('should format a conventional commit object into a string', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description: 'add new component',
        body: 'Detailed description',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const formatted = formatConventionalCommit(commit);
      expect(formatted).toBe('feat(ui): add new component\n\nDetailed description');
    });

    it('should format a commit without scope', () => {
      const commit: ConventionalCommit = {
        type: 'docs',
        scope: '',
        description: 'update README',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const formatted = formatConventionalCommit(commit);
      expect(formatted).toBe('docs: update README');
    });

    it('should include breaking change marker when needed', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'api',
        description: 'change response format',
        body: '',
        isBreakingChange: true,
        footer: 'BREAKING CHANGE: This changes the API',
        isValid: true,
      };

      const formatted = formatConventionalCommit(commit);
      expect(formatted).toBe(
        'feat(api)!: change response format\n\nBREAKING CHANGE: This changes the API',
      );
    });

    it('should handle multi-paragraph body and footer', () => {
      const commit: ConventionalCommit = {
        type: 'fix',
        scope: 'core',
        description: 'resolve memory leak',
        body: 'First paragraph.\n\nSecond paragraph.',
        isBreakingChange: false,
        footer: 'Reviewed-by: Jane\nRefs: #123',
        isValid: true,
      };

      const formatted = formatConventionalCommit(commit);
      expect(formatted).toContain('First paragraph.');
      expect(formatted).toContain('Second paragraph.');
      expect(formatted).toContain('Reviewed-by: Jane');
      expect(formatted).toContain('Refs: #123');
    });
  });

  describe('validateConventionalCommit', () => {
    it('should validate a valid commit object', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description: 'add new component',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid commit types', () => {
      const commit: ConventionalCommit = {
        type: 'invalid',
        scope: '',
        description: 'something',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: false,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid commit type: invalid');
    });

    it('should enforce description requirements', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description: '',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Description is required');
    });

    it('should warn about long descriptions', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description:
          'a '.repeat(50) + 'very long description that exceeds the recommended length limit',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.warnings).toContain('Description is too long (> 100 characters)');
    });

    it('should suggest using a footer for breaking changes', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description: 'add new component',
        body: '',
        isBreakingChange: true,
        footer: '',
        isValid: true,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.warnings).toContain('Breaking changes should be described in the footer');
    });

    it('should warn about lowercase description start', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        scope: 'ui',
        description: 'add new component',
        body: '',
        isBreakingChange: false,
        footer: '',
        isValid: true,
      };

      const validation = validateConventionalCommit(commit);
      expect(validation.warnings).toContain('Description should start with a capital letter');
    });
  });
});
