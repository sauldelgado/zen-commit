import React, { useState, useEffect, useCallback } from 'react';
// We'll need to keep the mock TextInput for now
const TextInput = (props: any) => {
  return React.createElement('input', props, null);
};
import { Box, Text } from './';
import { useInput } from 'ink';
import MessageValidator from './MessageValidator';
import ValidationSummary from './ValidationSummary';
import QualityIndicator from './QualityIndicator';
import CharacterCounter from './CharacterCounter';
import WarningPanel from './WarningPanel';
import { createPatternMatcher, PatternMatcher } from '../../core/patterns/pattern-matcher';
import { createWarningManager } from '../../core/patterns/warning-manager';
import { useMessageValidation } from '../hooks/useMessageValidation';
import { debounce } from '../../utils/debounce';
import { createOverrideManager } from '../../core/override-manager';
import OverrideList from './OverrideList';

export interface CommitMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSubjectBodySeparation?: boolean;
  subjectLimit?: number;
  onSubmit?: (value: string) => void;
  conventionalCommit?: boolean;
  showValidation?: boolean;
  showSuggestions?: boolean;
  showFeedback?: boolean;
  feedbackExpanded?: boolean;
  patternMatcher?: PatternMatcher;
}

/**
 * Component for entering a commit message with optional subject/body separation
 */
const CommitMessageInput: React.FC<CommitMessageInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter a commit message...',
  showSubjectBodySeparation = false,
  subjectLimit = 50,
  onSubmit,
  conventionalCommit = false,
  showValidation = true,
  showSuggestions = false,
  showFeedback = false,
  feedbackExpanded = false,
  patternMatcher,
}) => {
  const [focusedField, setFocusedField] = useState<'subject' | 'body'>('subject');
  const [showWarnings, setShowWarnings] = useState(true);
  const [showOverrideList, setShowOverrideList] = useState(false);

  // Create/use pattern matcher and warning manager
  const defaultPatternMatcher = React.useMemo(
    () => createPatternMatcher({ includeBuiltIn: true }),
    [],
  );
  const effectivePatternMatcher = patternMatcher || defaultPatternMatcher;
  const warningManager = React.useMemo(() => createWarningManager(), []);

  // Create override manager
  const overrideManager = React.useMemo(() => createOverrideManager(), []);

  // Get validation result
  const validation = useMessageValidation(value, {
    conventionalCommit,
    provideSuggestions: showSuggestions,
    subjectLengthLimit: subjectLimit,
  });

  // Create a debounced analyze function (300ms delay)
  const debouncedAnalyze = useCallback(
    debounce((text: string) => {
      // Get patterns for analysis, filtering out overridden patterns
      const patterns = effectivePatternMatcher
        .getPatterns()
        .filter((pattern) => !overrideManager.isPatternOverridden(pattern.id));

      // Use only non-overridden patterns for analysis
      const analysis = effectivePatternMatcher.analyzeMessage(text, { patterns });
      warningManager.setWarnings(analysis.matches);
    }, 300),
    [effectivePatternMatcher, warningManager, overrideManager],
  );

  // Analyze message for patterns when it changes (debounced)
  useEffect(() => {
    debouncedAnalyze(value);
  }, [value, debouncedAnalyze]);

  // Get current warnings
  const currentWarnings = warningManager.getWarnings();

  // Handle keyboard shortcuts
  useInput(
    useCallback(
      (input, key) => {
        // Toggle override list with Ctrl+O
        if (input === 'o' && key.ctrl) {
          setShowOverrideList(!showOverrideList);
        }
      },
      [showOverrideList],
    ),
  );

  // Handle warning dismissal
  const handleDismissWarnings = () => {
    setShowWarnings(false);
  };

  // Handle permanent pattern dismissal
  const handleDismissPattern = (patternId: string) => {
    warningManager.persistentlyDismissPattern(patternId);
    effectivePatternMatcher.disablePattern(patternId);
  };

  // Handle overriding a pattern
  const handleOverridePattern = (patternId: string, reason: string, isPermanent: boolean) => {
    // Add override
    overrideManager.overridePattern(patternId, reason);

    // If permanent, also disable the pattern in the matcher
    if (isPermanent) {
      effectivePatternMatcher.disablePattern(patternId);
    }

    // Refresh warnings (this will filter out the overridden one)
    warningManager.dismissWarning(patternId);

    // Re-analyze message
    debouncedAnalyze(value);
  };

  // Handle removing an override
  const handleRemoveOverride = (patternId: string) => {
    overrideManager.removeOverride(patternId);
    effectivePatternMatcher.enablePattern(patternId);

    // Re-analyze to show any new warnings
    debouncedAnalyze(value);
  };

  const lines = value.split('\n');
  const subject = lines[0] || '';
  const body = lines.slice(1).join('\n');
  const isSubjectTooLong = subject.length > subjectLimit;

  const handleSubjectChange = (newSubject: string) => {
    const newValue = [newSubject, ...lines.slice(1)].join('\n');
    onChange(newValue);
  };

  const handleBodyChange = (newBody: string) => {
    const newValue = [subject, newBody].join('\n');
    onChange(newValue);
  };

  const handleSubjectSubmit = () => {
    setFocusedField('body');
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
  };

  if (!showSubjectBodySeparation) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Box marginBottom={1}>
          <Text bold>Commit message:</Text>
        </Box>

        {/* Real-time feedback above input */}
        {showFeedback && (
          <Box marginBottom={1}>
            <QualityIndicator score={validation.qualityScore} label="Quality" width={6} />

            {validation.isSubjectTooLong && (
              <Box marginLeft={2}>
                <Text color="red">Subject too long</Text>
              </Box>
            )}

            {conventionalCommit && !validation.isConventionalCommit && (
              <Box marginLeft={2}>
                <Text color="red">Not conventional format</Text>
              </Box>
            )}
          </Box>
        )}

        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onSubmit={handleSubmit}
        />

        {/* Add validation if enabled */}
        {showValidation && (
          <Box marginTop={1} flexDirection="column">
            {showFeedback ? (
              <ValidationSummary validation={validation} expanded={feedbackExpanded} />
            ) : (
              <MessageValidator
                message={value}
                conventionalCommit={conventionalCommit}
                showSuggestions={showSuggestions}
                subjectLengthLimit={subjectLimit}
              />
            )}
          </Box>
        )}

        {/* Show override list when requested */}
        {showOverrideList && (
          <Box marginTop={1}>
            <OverrideList
              overrides={overrideManager.getOverrides()}
              onRemoveOverride={handleRemoveOverride}
            />
          </Box>
        )}

        {/* Show warning panel when there are warnings */}
        {showWarnings && currentWarnings.length > 0 && (
          <Box marginTop={1}>
            <WarningPanel
              warnings={currentWarnings}
              onDismiss={handleDismissWarnings}
              onDismissPattern={handleDismissPattern}
              overrideManager={overrideManager}
              onOverridePattern={handleOverridePattern}
            />
          </Box>
        )}

        <Box marginTop={1}>
          <Text dimColor>Ctrl+O: Toggle overrides | Enter: Submit | Esc: Cancel</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1} flexDirection="row">
        <Text bold>Subject:</Text>

        {showFeedback ? (
          <Box marginLeft={2}>
            <CharacterCounter
              current={subject.length}
              limit={subjectLimit}
              showWarning={isSubjectTooLong}
            />
          </Box>
        ) : (
          isSubjectTooLong && (
            <Text color="yellow">
              {' '}
              (Subject line too long: {subject.length}/{subjectLimit})
            </Text>
          )
        )}
      </Box>

      {focusedField === 'subject' ? (
        <TextInput
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Brief summary of changes"
          onSubmit={handleSubjectSubmit}
        />
      ) : (
        <Box>
          <Text>{subject || <Text dimColor>No subject</Text>}</Text>
        </Box>
      )}

      <Box marginY={1}>
        <Text bold>Body:</Text>
        <Text dimColor> (Optional - Provide more detailed explanation)</Text>
      </Box>

      {focusedField === 'body' ? (
        <TextInput
          value={body}
          onChange={handleBodyChange}
          placeholder="Detailed explanation"
          onSubmit={handleSubmit}
        />
      ) : (
        <Box>
          <Text>{body || <Text dimColor>No body</Text>}</Text>
        </Box>
      )}

      {/* Add validation if enabled */}
      {showValidation && (
        <Box marginTop={1} flexDirection="column">
          {showFeedback ? (
            <ValidationSummary validation={validation} expanded={feedbackExpanded} />
          ) : (
            <MessageValidator
              message={value}
              conventionalCommit={conventionalCommit}
              showSuggestions={showSuggestions}
              subjectLengthLimit={subjectLimit}
            />
          )}
        </Box>
      )}

      {/* Show override list when requested */}
      {showOverrideList && (
        <Box marginTop={1}>
          <OverrideList
            overrides={overrideManager.getOverrides()}
            onRemoveOverride={handleRemoveOverride}
          />
        </Box>
      )}

      {/* Show warning panel when there are warnings */}
      {showWarnings && currentWarnings.length > 0 && (
        <Box marginTop={1}>
          <WarningPanel
            warnings={currentWarnings}
            onDismiss={handleDismissWarnings}
            onDismissPattern={handleDismissPattern}
            overrideManager={overrideManager}
            onOverridePattern={handleOverridePattern}
          />
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          Tab: Switch fields | Ctrl+O: Toggle overrides | Enter: Submit | Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
};

export default CommitMessageInput;
