/**
 * Interface for an override record
 *
 * @property patternId - ID of the pattern being overridden
 * @property reason - Justification for overriding this pattern
 * @property category - Optional category for grouping overrides
 * @property createdAt - ISO date string when the override was created
 */
export interface OverrideRecord {
  patternId: string;
  reason: string;
  category?: string;
  createdAt: string;
}

/**
 * Interface for the override manager
 */
export interface OverrideManager {
  /**
   * Override a pattern with a reason
   * @param patternId ID of the pattern to override
   * @param reason Justification for overriding
   * @param category Optional category for grouping
   */
  overridePattern(patternId: string, reason: string, category?: string): void;

  /**
   * Check if a pattern is overridden
   * @param patternId ID of the pattern to check
   * @returns True if the pattern is overridden
   */
  isPatternOverridden(patternId: string): boolean;

  /**
   * Remove an override by pattern ID
   * @param patternId ID of the pattern to remove override for
   */
  removeOverride(patternId: string): void;

  /**
   * Get all overrides
   * @returns Array of all override records
   */
  getOverrides(): OverrideRecord[];

  /**
   * Get overrides filtered by category
   * @param category Category to filter by
   * @returns Array of override records in the specified category
   */
  getOverridesByCategory(category: string): OverrideRecord[];

  /**
   * Clear all overrides
   */
  clearAllOverrides(): void;

  /**
   * Import overrides from JSON
   * @param overrides Array of override records to import
   */
  importOverrides(overrides: OverrideRecord[]): void;

  /**
   * Export overrides to JSON
   * @returns Array of all override records
   */
  exportOverrides(): OverrideRecord[];
}

/**
 * Factory function to create an override manager
 *
 * @returns A new override manager instance
 */
export const createOverrideManager = (): OverrideManager => {
  // Store overrides in memory with pattern ID as key for efficient lookups
  const overrides = new Map<string, OverrideRecord>();

  return {
    /**
     * Override a pattern with a reason
     */
    overridePattern(patternId: string, reason: string, category?: string): void {
      overrides.set(patternId, {
        patternId,
        reason,
        category,
        createdAt: new Date().toISOString(),
      });
    },

    /**
     * Check if a pattern is overridden
     */
    isPatternOverridden(patternId: string): boolean {
      return overrides.has(patternId);
    },

    /**
     * Remove an override by pattern ID
     */
    removeOverride(patternId: string): void {
      overrides.delete(patternId);
    },

    /**
     * Get all overrides
     */
    getOverrides(): OverrideRecord[] {
      return Array.from(overrides.values());
    },

    /**
     * Get overrides filtered by category
     */
    getOverridesByCategory(category: string): OverrideRecord[] {
      return Array.from(overrides.values()).filter((override) => override.category === category);
    },

    /**
     * Clear all overrides
     */
    clearAllOverrides(): void {
      overrides.clear();
    },

    /**
     * Import overrides from JSON
     */
    importOverrides(overridesToImport: OverrideRecord[]): void {
      for (const override of overridesToImport) {
        overrides.set(override.patternId, {
          ...override,
          createdAt: override.createdAt || new Date().toISOString(),
        });
      }
    },

    /**
     * Export overrides to JSON
     */
    exportOverrides(): OverrideRecord[] {
      return Array.from(overrides.values());
    },
  };
};
