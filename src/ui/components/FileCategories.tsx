import React from 'react';
import { Box, Text } from './';
import { FileChange, FileType } from '../../git/change-detection/types';
import path from 'path';

/**
 * Category definition
 */
export interface Category {
  id: string;
  label: string;
  fileTypes: FileType[];
}

/**
 * Default categories
 */
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'source',
    label: 'Source Files',
    fileTypes: ['source'],
  },
  {
    id: 'test',
    label: 'Tests',
    fileTypes: ['test'],
  },
  {
    id: 'docs',
    label: 'Documentation',
    fileTypes: ['docs'],
  },
  {
    id: 'config',
    label: 'Configuration',
    fileTypes: ['config'],
  },
  {
    id: 'assets',
    label: 'Assets',
    fileTypes: ['assets'],
  },
  {
    id: 'other',
    label: 'Other Files',
    fileTypes: ['other'],
  },
];

export interface FileCategoriesProps {
  changes: FileChange[];
  categories?: Category[];
  showStats?: boolean;
  groupByDirectory?: boolean;
  filters?: string[];
}

/**
 * Component for displaying categorized file changes
 */
const FileCategories = ({
  changes,
  categories = DEFAULT_CATEGORIES,
  showStats = false,
  groupByDirectory = false,
  filters = [],
}: FileCategoriesProps) => {
  // Apply filters to changes
  const filteredChanges = applyFilters(changes, filters);

  if (filteredChanges.length === 0) {
    return (
      <Box marginY={1}>
        <Text dimColor>No files to display</Text>
      </Box>
    );
  }

  // Group by directory if requested
  if (groupByDirectory) {
    return renderDirectoryGroups(filteredChanges, showStats);
  }

  // Group by category
  return renderCategoryGroups(filteredChanges, categories, showStats);
};

/**
 * Apply filters to changes
 * @param changes File changes to filter
 * @param filters Active filters
 * @returns Filtered changes
 */
function applyFilters(changes: FileChange[], filters: string[]): FileChange[] {
  if (filters.length === 0) {
    return changes;
  }

  return changes.filter((change) => {
    // Check each filter
    for (const filter of filters) {
      const [type, value] = filter.split(':');

      if (type === 'fileType' && change.fileType !== value) {
        return false;
      }

      if (type === 'changeType' && change.type !== value) {
        return false;
      }

      if (type === 'directory') {
        const dir = path.dirname(change.path);
        if (!dir.startsWith(value)) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Render changes grouped by category
 * @param changes File changes
 * @param categories Categories to use
 * @param showStats Whether to show statistics
 * @returns JSX element
 */
function renderCategoryGroups(changes: FileChange[], categories: Category[], showStats: boolean) {
  return (
    <Box flexDirection="column">
      {categories.map((category) => {
        // Filter changes for this category
        const categoryChanges = changes.filter((change) =>
          category.fileTypes.includes(change.fileType || 'other'),
        );

        if (categoryChanges.length === 0) {
          return null;
        }

        return (
          <Box key={category.id} flexDirection="column" marginBottom={1}>
            <Box>
              <Text bold>{category.label}</Text>

              {showStats && (
                <Text dimColor>
                  {' '}
                  ({categoryChanges.length} {categoryChanges.length === 1 ? 'file' : 'files'} •{' '}
                  {getTotalInsertions(categoryChanges)} insertions •{' '}
                  {getTotalDeletions(categoryChanges)} deletions)
                </Text>
              )}
            </Box>

            <Box flexDirection="column" marginLeft={2}>
              {categoryChanges.map((change, index) => (
                <Box key={index} marginY={1}>
                  <Box width={2} marginRight={1}>
                    <Text color={getStatusColor(change.type)}>
                      {getStatusIndicator(change.type)}
                    </Text>
                  </Box>

                  <Box flex={1}>
                    <Text>{change.path}</Text>
                  </Box>

                  {showStats && (
                    <Box marginLeft={1}>
                      <Text color="green">{change.insertions ? `+${change.insertions}` : ''}</Text>
                      <Text color="red">{change.deletions ? ` -${change.deletions}` : ''}</Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Render changes grouped by directory
 * @param changes File changes
 * @param showStats Whether to show statistics
 * @returns JSX element
 */
function renderDirectoryGroups(changes: FileChange[], showStats: boolean) {
  // Group changes by directory
  const directories: Record<string, FileChange[]> = {};

  for (const change of changes) {
    const dir = path.dirname(change.path);

    if (!directories[dir]) {
      directories[dir] = [];
    }

    directories[dir].push(change);
  }

  return (
    <Box flexDirection="column">
      {Object.entries(directories).map(([dir, dirChanges]) => (
        <Box key={dir} flexDirection="column" marginBottom={1}>
          <Box>
            <Text bold>{dir}/</Text>

            {showStats && (
              <Text dimColor>
                {' '}
                ({dirChanges.length} {dirChanges.length === 1 ? 'file' : 'files'} •{' '}
                {getTotalInsertions(dirChanges)} insertions • {getTotalDeletions(dirChanges)}{' '}
                deletions)
              </Text>
            )}
          </Box>

          <Box flexDirection="column" marginLeft={2}>
            {dirChanges.map((change, index) => (
              <Box key={index} marginY={1}>
                <Box width={2} marginRight={1}>
                  <Text color={getStatusColor(change.type)}>{getStatusIndicator(change.type)}</Text>
                </Box>

                <Box flex={1}>
                  <Text>{path.basename(change.path)}</Text>
                </Box>

                {showStats && (
                  <Box marginLeft={1}>
                    <Text color="green">{change.insertions ? `+${change.insertions}` : ''}</Text>
                    <Text color="red">{change.deletions ? ` -${change.deletions}` : ''}</Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Get the status indicator for a change type
 * @param type Change type
 * @returns Status indicator
 */
function getStatusIndicator(type: string): string {
  switch (type) {
    case 'added':
      return 'A';
    case 'modified':
      return 'M';
    case 'deleted':
      return 'D';
    case 'renamed':
      return 'R';
    case 'copied':
      return 'C';
    default:
      return '?';
  }
}

/**
 * Get the status color for a change type
 * @param type Change type
 * @returns Color name
 */
function getStatusColor(type: string): string {
  switch (type) {
    case 'added':
      return 'green';
    case 'modified':
      return 'yellow';
    case 'deleted':
      return 'red';
    case 'renamed':
      return 'blue';
    case 'copied':
      return 'magenta';
    default:
      return 'white';
  }
}

/**
 * Get total insertions for a list of changes
 * @param changes File changes
 * @returns Total insertions
 */
function getTotalInsertions(changes: FileChange[]): number {
  return changes.reduce((total, change) => total + (change.insertions || 0), 0);
}

/**
 * Get total deletions for a list of changes
 * @param changes File changes
 * @returns Total deletions
 */
function getTotalDeletions(changes: FileChange[]): number {
  return changes.reduce((total, change) => total + (change.deletions || 0), 0);
}

export default FileCategories;
