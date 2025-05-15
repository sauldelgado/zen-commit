import { createGitOperations, isGitRepository, getRepositoryRoot } from '../git';

async function main() {
  try {
    // Check if current directory is a Git repository
    const isRepo = await isGitRepository(process.cwd());
    if (!isRepo) {
      console.error('Not in a Git repository');
      process.exit(1);
    }

    // Get repository root
    const repoRoot = await getRepositoryRoot(process.cwd());
    console.log('Repository root:', repoRoot);

    // Create Git operations interface
    const git = createGitOperations(repoRoot || process.cwd());

    // Get repository status
    const status = await git.getStatus();
    console.log('Repository status:');
    console.log('- Current branch:', status.current);
    console.log('- Is clean:', status.isClean);
    console.log('- Modified files:', status.modified);
    console.log('- Staged files:', status.staged);

    // Get current branch
    const branch = await git.getCurrentBranch();
    console.log('Current branch:', branch);

    // Get user name from Git config
    const userName = await git.getConfig('user.name');
    console.log('Git user name:', userName);

    // Get available branches
    const branches = await git.getBranches();
    console.log('Available branches:', branches);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
