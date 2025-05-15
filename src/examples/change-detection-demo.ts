import { getFileChanges, categorizeChanges, getChangeStats } from '../git';
import { isGitRepository, getRepositoryRoot } from '../git';

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

    // Get file changes
    const changes = await getFileChanges(repoRoot || process.cwd());
    console.log(`Found ${changes.length} changed files`);

    // Categorize changes
    const categories = categorizeChanges(changes);

    console.log('\nStaged changes:');
    categories.staged.forEach((file) => console.log(`  ${file}`));

    console.log('\nUnstaged changes:');
    categories.unstaged.forEach((file) => console.log(`  ${file}`));

    console.log('\nBy file type:');
    Object.entries(categories.byType).forEach(([type, files]) => {
      if (files.length > 0) {
        console.log(`  ${type}: ${files.length} files`);
      }
    });

    // Get change statistics
    const stats = getChangeStats(changes);
    console.log('\nChange statistics:');
    console.log(`  Total files: ${stats.totalFiles}`);
    console.log(`  Staged files: ${stats.stagedFiles}`);
    console.log(`  Unstaged files: ${stats.unstagedFiles}`);
    console.log(`  Insertions: ${stats.insertions}`);
    console.log(`  Deletions: ${stats.deletions}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
