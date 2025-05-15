declare module 'ink-testing-library' {
  import { ReactElement } from 'react';

  export interface RenderResult {
    lastFrame: () => string | null;
    frames: string[];
    stdin: {
      write: (input: string) => void;
    };
    rerender: (element: ReactElement) => void;
    unmount: () => void;
    cleanup: () => void;
  }

  export function render(element: ReactElement, options?: any): RenderResult;
}
