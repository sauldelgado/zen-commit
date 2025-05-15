import { useState, useEffect, useCallback } from 'react';
import {
  getFileChanges,
  categorizeChanges,
  getChangeStats,
  FileChange,
  ChangeCategories,
  ChangeStats,
} from '../../git/change-detection';

/**
 * Hook result for git changes
 */
interface UseGitChangesResult {
  changes: FileChange[];
  categories: ChangeCategories | null;
  stats: ChangeStats | null;
  loading: boolean;
  error: Error | null;
  refreshChanges: () => Promise<void>;
}

/**
 * Hook for fetching and managing Git changes
 * @param repoPath Path to the Git repository
 * @returns Hook result with changes, loading state, and refresh function
 */
export function useGitChanges(repoPath: string): UseGitChangesResult {
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [categories, setCategories] = useState<ChangeCategories | null>(null);
  const [stats, setStats] = useState<ChangeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get file changes from the Git repository
      const fileChanges = await getFileChanges(repoPath);
      setChanges(fileChanges);

      // Calculate categories and stats
      const changeCategories = categorizeChanges(fileChanges);
      setCategories(changeCategories);

      const changeStats = getChangeStats(fileChanges);
      setStats(changeStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [repoPath]);

  // Fetch changes on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Function to manually refresh changes
  const refreshChanges = useCallback(async () => {
    await fetchChanges();
  }, [fetchChanges]);

  return {
    changes,
    categories,
    stats,
    loading,
    error,
    refreshChanges,
  };
}
