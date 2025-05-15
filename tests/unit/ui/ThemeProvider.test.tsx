import React from 'react';
import { render } from 'ink-testing-library';
import { ThemeProvider, useTheme } from '@ui/ThemeProvider';
import { Text } from '@ui/components';

// Test component that uses the theme
const ThemedComponent = () => {
  const theme = useTheme();
  return <Text>{theme.colors.primary}</Text>;
};

describe('ThemeProvider', () => {
  it('should provide default theme', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <ThemedComponent />
      </ThemeProvider>,
    );

    // Default primary color is blue
    expect(lastFrame()).toContain('blue');
  });

  it('should override default theme with provided theme', () => {
    const customTheme = {
      colors: {
        primary: 'red',
      },
    };

    const { lastFrame } = render(
      <ThemeProvider theme={customTheme}>
        <ThemedComponent />
      </ThemeProvider>,
    );

    // Custom primary color is red
    expect(lastFrame()).toContain('red');
  });
});
