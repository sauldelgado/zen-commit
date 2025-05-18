import {
  OverrideManager,
  createOverrideManager,
  OverrideRecord,
} from '../../../src/core/override-manager';
import { Pattern } from '../../../src/core/patterns/pattern-detection';

describe('Override Manager', () => {
  let overrideManager: OverrideManager;

  beforeEach(() => {
    overrideManager = createOverrideManager();
  });

  describe('overridePattern', () => {
    it('should add a pattern to overrides', () => {
      const pattern: Pattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        description: 'A test pattern',
        regex: /test/i,
        severity: 'warning',
        category: 'best-practices',
      };

      overrideManager.overridePattern(pattern.id, 'Test reason');

      const overrides = overrideManager.getOverrides();
      expect(overrides).toHaveLength(1);
      expect(overrides[0].patternId).toBe('test-pattern');
      expect(overrides[0].reason).toBe('Test reason');
    });
  });

  describe('isPatternOverridden', () => {
    it('should check if a pattern is overridden', () => {
      overrideManager.overridePattern('test-pattern', 'Test reason');

      expect(overrideManager.isPatternOverridden('test-pattern')).toBe(true);
      expect(overrideManager.isPatternOverridden('other-pattern')).toBe(false);
    });
  });

  describe('removeOverride', () => {
    it('should remove an override by pattern ID', () => {
      overrideManager.overridePattern('test-pattern', 'Test reason');
      overrideManager.overridePattern('other-pattern', 'Other reason');

      overrideManager.removeOverride('test-pattern');

      const overrides = overrideManager.getOverrides();
      expect(overrides).toHaveLength(1);
      expect(overrides[0].patternId).toBe('other-pattern');
    });
  });

  describe('getOverridesByCategory', () => {
    it('should get overrides filtered by category', () => {
      overrideManager.overridePattern('test-pattern-1', 'Reason 1', 'category1');
      overrideManager.overridePattern('test-pattern-2', 'Reason 2', 'category2');
      overrideManager.overridePattern('test-pattern-3', 'Reason 3', 'category1');

      const category1Overrides = overrideManager.getOverridesByCategory('category1');
      expect(category1Overrides).toHaveLength(2);
      expect(category1Overrides.some((o) => o.patternId === 'test-pattern-1')).toBe(true);
      expect(category1Overrides.some((o) => o.patternId === 'test-pattern-3')).toBe(true);
    });
  });

  describe('clearAllOverrides', () => {
    it('should clear all overrides', () => {
      overrideManager.overridePattern('test-pattern-1', 'Reason 1');
      overrideManager.overridePattern('test-pattern-2', 'Reason 2');

      overrideManager.clearAllOverrides();

      const overrides = overrideManager.getOverrides();
      expect(overrides).toHaveLength(0);
    });
  });

  describe('importOverrides', () => {
    it('should import overrides from JSON', () => {
      const overridesToImport: OverrideRecord[] = [
        {
          patternId: 'imported-pattern-1',
          reason: 'Imported reason 1',
          category: 'category1',
          createdAt: new Date().toISOString(),
        },
      ];

      overrideManager.importOverrides(overridesToImport);

      const overrides = overrideManager.getOverrides();
      expect(overrides).toHaveLength(1);
      expect(overrides[0].patternId).toBe('imported-pattern-1');
    });
  });

  describe('exportOverrides', () => {
    it('should export overrides to JSON', () => {
      overrideManager.overridePattern('test-pattern', 'Test reason', 'test-category');

      const exported = overrideManager.exportOverrides();

      expect(exported).toHaveLength(1);
      expect(exported[0].patternId).toBe('test-pattern');
      expect(exported[0].reason).toBe('Test reason');
      expect(exported[0].category).toBe('test-category');
    });
  });
});
