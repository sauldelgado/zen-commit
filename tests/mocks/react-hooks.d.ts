export function renderHook<T>(callback: () => T): {
  result: { current: T };
  waitForNextUpdate: () => Promise<void>;
  rerender: jest.Mock;
  unmount: jest.Mock;
};

export function act(callback: () => void): void;
