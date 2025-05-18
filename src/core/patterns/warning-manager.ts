import { PatternMatch } from './pattern-detection';

/**
 * Interface for warning manager snapshot
 */
export interface WarningSnapshot {
  warnings: PatternMatch[];
  permanentlyDismissed: Set<string>;
}

/**
 * Interface for warning manager
 */
export interface WarningManager {
  setWarnings(warnings: PatternMatch[]): void;
  getWarnings(): PatternMatch[];
  dismissWarning(patternId: string): void;
  dismissAllWarnings(): void;
  persistentlyDismissPattern(patternId: string): void;
  removePersistentDismissal(patternId: string): void;
  isPermanentlyDismissed(patternId: string): boolean;
  reset(): void;
  createSnapshot(): WarningSnapshot;
  restoreSnapshot(snapshot: WarningSnapshot): void;
}

/**
 * Factory function to create a warning manager
 */
export const createWarningManager = (): WarningManager => {
  // Current warnings
  let currentWarnings: PatternMatch[] = [];

  // Patterns that are permanently dismissed
  const permanentlyDismissed = new Set<string>();

  return {
    /**
     * Set current warnings, filtering out permanently dismissed patterns
     */
    setWarnings(warnings: PatternMatch[]): void {
      // Filter out permanently dismissed patterns
      currentWarnings = warnings.filter((warning) => !permanentlyDismissed.has(warning.patternId));
    },

    /**
     * Get current warnings
     */
    getWarnings(): PatternMatch[] {
      return [...currentWarnings];
    },

    /**
     * Dismiss a specific warning by pattern ID
     */
    dismissWarning(patternId: string): void {
      currentWarnings = currentWarnings.filter((warning) => warning.patternId !== patternId);
    },

    /**
     * Dismiss all current warnings
     */
    dismissAllWarnings(): void {
      currentWarnings = [];
    },

    /**
     * Permanently dismiss a pattern (will not show up in future warnings)
     */
    persistentlyDismissPattern(patternId: string): void {
      permanentlyDismissed.add(patternId);
      this.dismissWarning(patternId);
    },

    /**
     * Remove a permanent dismissal
     */
    removePersistentDismissal(patternId: string): void {
      permanentlyDismissed.delete(patternId);
    },

    /**
     * Check if a pattern is permanently dismissed
     */
    isPermanentlyDismissed(patternId: string): boolean {
      return permanentlyDismissed.has(patternId);
    },

    /**
     * Reset all warnings and dismissals
     */
    reset(): void {
      currentWarnings = [];
      permanentlyDismissed.clear();
    },

    /**
     * Create a snapshot of the current warning state
     */
    createSnapshot(): WarningSnapshot {
      return {
        warnings: [...currentWarnings],
        permanentlyDismissed: new Set(permanentlyDismissed),
      };
    },

    /**
     * Restore a warning state from a snapshot
     */
    restoreSnapshot(snapshot: WarningSnapshot): void {
      currentWarnings = [...snapshot.warnings];
      permanentlyDismissed.clear();
      snapshot.permanentlyDismissed.forEach((id) => {
        permanentlyDismissed.add(id);
      });
    },
  };
};
