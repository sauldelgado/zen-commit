import React from 'react';
import { Box, Text } from './';
import { ValidationResult } from '../hooks/useMessageValidation';
import QualityIndicator from './QualityIndicator';

export interface ValidationSummaryProps {
  validation: ValidationResult;
  expanded?: boolean;
  compact?: boolean;
}

/**
 * Component for displaying a summary of message validation
 */
const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validation,
  expanded = false,
  compact = false,
}) => {
  const { errors, warnings, suggestions, qualityScore, isValid } = validation;

  // Determine overall status
  const hasIssues = errors.length > 0 || warnings.length > 0;

  // Emoji indicators
  const statusEmoji = hasIssues ? '⚠️ ' : isValid ? '✅ ' : '❓ ';

  return (
    <Box flexDirection="column">
      {/* Status header */}
      <Box>
        <Text bold>
          {statusEmoji}
          {hasIssues
            ? 'Issues found'
            : qualityScore > 0.8
              ? 'Good commit message'
              : 'Acceptable commit message'}
        </Text>
      </Box>

      {/* Quick summary */}
      <Box marginY={1} flexDirection={compact ? 'row' : 'column'}>
        {!compact && <QualityIndicator score={qualityScore} label="Quality" />}

        {compact ? (
          <Box>
            {errors.length > 0 && (
              <Text color="red" marginRight={1}>
                {errors.length} {errors.length === 1 ? 'error' : 'errors'}
              </Text>
            )}

            {warnings.length > 0 && (
              <Text color="yellow" marginRight={1}>
                {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
              </Text>
            )}

            {suggestions.length > 0 && (
              <Text color="blue" marginRight={1}>
                {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
              </Text>
            )}

            {!hasIssues && suggestions.length === 0 && <Text color="green">No issues</Text>}
          </Box>
        ) : (
          <>
            {errors.length > 0 && (
              <Text color="red">
                {errors.length} {errors.length === 1 ? 'error' : 'errors'}
              </Text>
            )}

            {warnings.length > 0 && (
              <Text color="yellow">
                {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
              </Text>
            )}

            {suggestions.length > 0 && (
              <Text color="blue">
                {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
              </Text>
            )}
          </>
        )}

        {compact && <QualityIndicator score={qualityScore} width={6} />}
      </Box>

      {/* Detailed issues (when expanded) */}
      {expanded && (
        <>
          {errors.length > 0 && (
            <Box flexDirection="column" marginBottom={1}>
              <Text color="red" bold>
                Errors:
              </Text>
              {errors.map((error, index) => (
                <Box key={index} marginLeft={2}>
                  <Text color="red">• {error}</Text>
                </Box>
              ))}
            </Box>
          )}

          {warnings.length > 0 && (
            <Box flexDirection="column" marginBottom={1}>
              <Text color="yellow" bold>
                Warnings:
              </Text>
              {warnings.map((warning, index) => (
                <Box key={index} marginLeft={2}>
                  <Text color="yellow">• {warning}</Text>
                </Box>
              ))}
            </Box>
          )}

          {suggestions.length > 0 && (
            <Box flexDirection="column">
              <Text color="blue" bold>
                Suggestions:
              </Text>
              {suggestions.map((suggestion, index) => (
                <Box key={index} marginLeft={2}>
                  <Text color="blue">• {suggestion}</Text>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ValidationSummary;
