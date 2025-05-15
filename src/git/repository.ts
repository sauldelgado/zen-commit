import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';

/**
 * Check if the given directory is within a Git repository
 * @param directory The directory to check
 * @returns True if the directory is within a Git repository, false otherwise
 */
export const isGitRepository = async (directory: string): Promise<boolean> => {
  try {
    const git: SimpleGit = simpleGit(directory);
    return await git.checkIsRepo();
  } catch (error) {
    // Handle errors gracefully
    return false;
  }
};

/**
 * Get the root directory of the Git repository containing the given directory
 * @param directory The directory to check
 * @returns The root directory of the Git repository, or null if not in a repository
 */
export const getRepositoryRoot = async (directory: string): Promise<string | null> => {
  try {
    if (!(await isGitRepository(directory))) {
      return null;
    }

    const git: SimpleGit = simpleGit(directory);
    // 'git rev-parse --show-toplevel' returns the repository root
    const rootPath = await git.revparse(['--show-toplevel']);
    return rootPath;
  } catch (error) {
    return null;
  }
};

/**
 * Get basic information about the repository status
 * @param directory The directory to check
 * @returns Object containing repository status information
 */
export const getRepositoryStatus = async (
  directory: string,
): Promise<{
  isRepo: boolean;
  root: string | null;
  currentBranch: string | null;
  isClean: boolean;
}> => {
  try {
    const isRepo = await isGitRepository(directory);

    if (!isRepo) {
      return {
        isRepo: false,
        root: null,
        currentBranch: null,
        isClean: false,
      };
    }

    const git: SimpleGit = simpleGit(directory);
    const root = await getRepositoryRoot(directory);
    const status = await git.status();

    return {
      isRepo: true,
      root,
      currentBranch: status.current,
      isClean: status.isClean(),
    };
  } catch (error) {
    return {
      isRepo: false,
      root: null,
      currentBranch: null,
      isClean: false,
    };
  }
};

/**
 * Check if the current repository is a Git submodule
 * @param directory The directory to check
 * @returns True if the directory is a submodule, false otherwise
 */
export const isSubmodule = async (directory: string): Promise<boolean> => {
  try {
    const git: SimpleGit = simpleGit(directory);
    // This git command returns the path to the superproject if in a submodule, empty string otherwise
    const superprojectPath = await git.raw(['rev-parse', '--show-superproject-working-tree']);
    return superprojectPath.trim() !== '';
  } catch (error) {
    return false;
  }
};

/**
 * Find the top-level repository when there might be nested repositories
 * @param directory The directory to start searching from
 * @returns The path to the top-level repository
 */
export const findTopLevelRepository = async (directory: string): Promise<string | null> => {
  try {
    const currentRepoRoot = await getRepositoryRoot(directory);

    if (!currentRepoRoot) {
      return null;
    }

    // Check if this repository is within another repository
    let parentDir = path.dirname(currentRepoRoot);
    const parentRepoRoot = await getRepositoryRoot(parentDir);

    if (!parentRepoRoot || parentRepoRoot === currentRepoRoot) {
      // No parent repository or same repository (reached the top)
      return currentRepoRoot;
    }

    // If we're in a submodule, return the current repository root
    if (await isSubmodule(currentRepoRoot)) {
      return currentRepoRoot;
    }

    // Otherwise, return the parent repository root
    return parentRepoRoot;
  } catch (error) {
    return null;
  }
};

/**
 * Validate that the repository is in a state where commits can be made
 * @param directory The directory to check
 * @returns Validation result with any error messages
 */
export const validateRepository = async (
  directory: string,
): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];

  try {
    // Check if it's a Git repository
    if (!(await isGitRepository(directory))) {
      errors.push('Not a Git repository');
      return { isValid: false, errors };
    }

    const git: SimpleGit = simpleGit(directory);

    // Check if it's a bare repository (can't commit to a bare repo)
    const isBare = (await git.raw(['rev-parse', '--is-bare-repository'])).trim() === 'true';
    if (isBare) {
      errors.push('Cannot commit in a bare repository');
    }

    // Add more repository health checks as needed

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(
      `Error validating repository: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { isValid: false, errors };
  }
};
