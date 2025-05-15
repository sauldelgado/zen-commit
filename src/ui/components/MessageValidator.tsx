import React from 'react';
import { Box, Text } from './';
import { useMessageValidation, ValidationOptions } from '../hooks/useMessageValidation';

export interface MessageValidatorProps {
  message: string;
  conventionalCommit?: boolean;
  showSuggestions?: boolean;
  subjectLengthLimit?: number;
}

/**
 * Component for validating commit messages
 */
const MessageValidator: React.FC<MessageValidatorProps> = ({
  message,
  conventionalCommit = false,
  showSuggestions = false,
  subjectLengthLimit = 50,
}) => {
  // Create validation options
  const options: ValidationOptions = {
    conventionalCommit,
    provideSuggestions: showSuggestions,
    subjectLengthLimit,
  };

  // Validate message
  const validation = useMessageValidation(message, options);

  return (
    <Box flexDirection="column">
      {/* Subject line */}
      <Box>
        <Text>Subject: </Text>
        <Text color={validation.isSubjectTooLong ? 'red' : 'green'}>
          {validation.subjectLength}/{subjectLengthLimit}
        </Text>
        {validation.isSubjectTooLong && <Text color="red"> Subject too long</Text>}
      </Box>

      {/* Body */}
      {validation.hasBody && (
        <Box>
          <Text>Body: </Text>
          <Text>{validation.bodyLength}</Text>
        </Box>
      )}

      {/* Conventional commit validation */}
      {conventionalCommit && (
        <Box marginTop={1}>
          <Text>Format: </Text>
          {validation.isConventionalCommit ? (
            <Text color="green">Valid conventional commit</Text>
          ) : (
            <Text color="red">Not a conventional commit</Text>
          )}
        </Box>
      )}

      {/* Display parts if valid conventional commit */}
      {conventionalCommit && validation.isConventionalCommit && validation.conventionalParts && (
        <Box flexDirection="column" marginLeft={2}>
          <Box>
            <Text dimColor>Type: </Text>
            <Text>{validation.conventionalParts.type}</Text>
          </Box>
          {validation.conventionalParts.scope && (
            <Box>
              <Text dimColor>Scope: </Text>
              <Text>{validation.conventionalParts.scope}</Text>
            </Box>
          )}
          <Box>
            <Text dimColor>Breaking: </Text>
            <Text>{validation.conventionalParts.breaking ? 'Yes' : 'No'}</Text>
          </Box>
        </Box>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="red">Errors:</Text>
          {validation.errors.map((error, index) => (
            <Box key={index} marginLeft={2}>
              <Text color="red">- {error}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="yellow">Warnings:</Text>
          {validation.warnings.map((warning, index) => (
            <Box key={index} marginLeft={2}>
              <Text color="yellow">- {warning}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Suggestions */}
      {showSuggestions && validation.suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="blue">Suggestions:</Text>
          {validation.suggestions.map((suggestion, index) => (
            <Box key={index} marginLeft={2}>
              <Text color="blue">- {suggestion}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Quality indicator */}
      {showSuggestions && (
        <Box marginTop={1}>
          <Text>Quality: </Text>
          <Text
            color={
              validation.qualityScore > 0.8
                ? 'green'
                : validation.qualityScore > 0.5
                  ? 'yellow'
                  : 'red'
            }
          >
            {Math.round(validation.qualityScore * 100)}%
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default MessageValidator;
