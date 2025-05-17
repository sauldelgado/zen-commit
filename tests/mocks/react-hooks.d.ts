export function renderHook<T>(callback: () => T): {
  result: { current: T };
  waitForNextUpdate: () => Promise<void>;
  rerender: jest.Mock;
  unmount: jest.Mock;
};

export function act(callback: () => void): void;

// Add global type for useInput callback
declare global {
  interface Window {
    __useInputCallback?: (
      input: string,
      key: { escape?: boolean; return?: boolean; tab?: boolean },
    ) => void;
  }
}
