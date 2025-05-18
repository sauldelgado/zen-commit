import {
  WarningManager,
  createWarningManager,
} from '../../../../src/core/patterns/warning-manager';
import { PatternMatch } from '../../../../src/core/patterns/pattern-detection';

describe('Warning Manager', () => {
  let warningManager: WarningManager;

  beforeEach(() => {
    warningManager = createWarningManager();
  });

  describe('setWarnings', () => {
    it('should set and retrieve warnings', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning',
          name: 'Test Warning',
          description: 'This is a test warning',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match',
        },
      ];

      warningManager.setWarnings(warnings);

      const currentWarnings = warningManager.getWarnings();
      expect(currentWarnings).toEqual(warnings);
    });
  });

  describe('dismissWarning', () => {
    it('should dismiss a warning by ID', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning-1',
          name: 'Test Warning 1',
          description: 'This is test warning 1',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match 1',
        },
        {
          patternId: 'test-warning-2',
          name: 'Test Warning 2',
          description: 'This is test warning 2',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match 2',
        },
      ];

      warningManager.setWarnings(warnings);
      warningManager.dismissWarning('test-warning-1');

      const currentWarnings = warningManager.getWarnings();
      expect(currentWarnings.length).toBe(1);
      expect(currentWarnings[0].patternId).toBe('test-warning-2');
    });
  });

  describe('dismissAllWarnings', () => {
    it('should dismiss all warnings', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning-1',
          name: 'Test Warning 1',
          description: 'This is test warning 1',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match 1',
        },
        {
          patternId: 'test-warning-2',
          name: 'Test Warning 2',
          description: 'This is test warning 2',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match 2',
        },
      ];

      warningManager.setWarnings(warnings);
      warningManager.dismissAllWarnings();

      const currentWarnings = warningManager.getWarnings();
      expect(currentWarnings.length).toBe(0);
    });
  });

  describe('persistentlyDismissPattern', () => {
    it('should permanently dismiss a pattern', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning',
          name: 'Test Warning',
          description: 'This is a test warning',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match',
        },
      ];

      warningManager.setWarnings(warnings);
      warningManager.persistentlyDismissPattern('test-warning');

      // Current warnings should be empty
      const currentWarnings = warningManager.getWarnings();
      expect(currentWarnings.length).toBe(0);

      // Setting the same warning again should not show it
      warningManager.setWarnings(warnings);
      const afterWarnings = warningManager.getWarnings();
      expect(afterWarnings.length).toBe(0);
    });
  });

  describe('isPermanentlyDismissed', () => {
    it('should check if a pattern is permanently dismissed', () => {
      warningManager.persistentlyDismissPattern('test-warning');

      const isDismissed = warningManager.isPermanentlyDismissed('test-warning');
      expect(isDismissed).toBe(true);

      const isOtherDismissed = warningManager.isPermanentlyDismissed('other-warning');
      expect(isOtherDismissed).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all warnings and dismissals', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning',
          name: 'Test Warning',
          description: 'This is a test warning',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match',
        },
      ];

      warningManager.setWarnings(warnings);
      warningManager.persistentlyDismissPattern('other-warning');

      warningManager.reset();

      const currentWarnings = warningManager.getWarnings();
      expect(currentWarnings.length).toBe(0);

      const isDismissed = warningManager.isPermanentlyDismissed('other-warning');
      expect(isDismissed).toBe(false);
    });
  });

  describe('createSnapshot and restoreSnapshot', () => {
    it('should create and restore warning state snapshots', () => {
      const warnings: PatternMatch[] = [
        {
          patternId: 'test-warning',
          name: 'Test Warning',
          description: 'This is a test warning',
          severity: 'warning',
          category: 'best-practices',
          index: 0,
          length: 10,
          matchedText: 'Test match',
        },
      ];

      warningManager.setWarnings(warnings);
      warningManager.persistentlyDismissPattern('other-warning');

      const snapshot = warningManager.createSnapshot();

      // Change state
      warningManager.dismissAllWarnings();
      warningManager.persistentlyDismissPattern('test-warning');

      // Restore snapshot
      warningManager.restoreSnapshot(snapshot);

      // Check restored state
      const restoredWarnings = warningManager.getWarnings();
      expect(restoredWarnings).toEqual(warnings);

      expect(warningManager.isPermanentlyDismissed('other-warning')).toBe(true);
      expect(warningManager.isPermanentlyDismissed('test-warning')).toBe(false);
    });
  });
});
