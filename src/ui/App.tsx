import React, { ReactNode } from 'react';
// Mock render function
const render = (_element: React.ReactElement, _options = {}) => {
  return {
    unmount: () => {},
    waitUntilExit: () => Promise.resolve(),
    cleanup: () => {},
    rerender: () => {},
    frames: [],
    lastFrame: () => "",
  };
};
import { ThemeProvider } from './ThemeProvider';
import { Theme, DeepPartial } from './theme';

export interface AppProps {
  children: ReactNode;
  theme?: DeepPartial<Theme>;
  _onExit?: () => void;
}

/**
 * Main app wrapper for Zen Commit CLI
 */
const App: React.FC<AppProps> = ({ 
  children, 
  theme, 
  _onExit 
}) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

/**
 * Render the app
 * @param element The element to render
 * @param onExit Callback when the app exits
 * @returns The render instance
 */
export const renderApp = (
  element: React.ReactElement,
  _onExit?: () => void
) => {
  return render(element, {});
};

export default App;