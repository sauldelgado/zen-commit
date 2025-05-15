// Type definitions for ink
declare module 'ink' {
  import * as React from 'react';

  export interface RenderOptions {
    stdout?: NodeJS.WriteStream;
    stdin?: NodeJS.ReadStream;
    exitOnCtrlC?: boolean;
    debug?: boolean;
    patchConsole?: boolean;
    onExit?: () => void;
  }

  export interface Instance {
    rerender: (tree: React.ReactElement) => void;
    unmount: () => void;
    waitUntilExit: () => Promise<void>;
    cleanup: () => void;
    clear: () => void;
    frames: string[];
    lastFrame: () => string;
  }

  export function render(tree: React.ReactElement, options?: RenderOptions): Instance;

  export interface BoxProps {
    borderStyle?:
      | 'single'
      | 'double'
      | 'round'
      | 'bold'
      | 'singleDouble'
      | 'doubleSingle'
      | 'classic';
    borderColor?: string;
    dimBorder?: boolean;
    padding?: number | [number, number] | [number, number, number, number];
    margin?: number | [number, number] | [number, number, number, number];
    marginX?: number;
    marginY?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    paddingX?: number;
    paddingY?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    alignItems?: 'flex-start' | 'center' | 'flex-end';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    gap?: number;
    rowGap?: number;
    columnGap?: number;
  }

  export interface TextProps {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    color?: string;
    backgroundColor?: string;
    dimColor?: boolean;
    inverse?: boolean;
    wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
    children: React.ReactNode;
  }

  export const Box: React.FC<BoxProps & React.PropsWithChildren<{}>>;
  export const Text: React.FC<TextProps>;

  export function useInput(
    callback: (
      input: string,
      key: {
        upArrow: boolean;
        downArrow: boolean;
        leftArrow: boolean;
        rightArrow: boolean;
        return: boolean;
        escape: boolean;
        ctrl: boolean;
        shift: boolean;
        tab: boolean;
        backspace: boolean;
        delete: boolean;
        meta: boolean;
      },
    ) => void,
    options?: {
      isActive?: boolean;
    },
  ): void;

  export function useApp(): {
    exit: (error?: Error) => void;
  };

  export function useStdin(): {
    stdin: NodeJS.ReadStream;
    setRawMode: (value: boolean) => void;
    isRawModeSupported: boolean;
    internal_: {
      readline: any;
    };
  };

  export function useStdout(): {
    stdout: NodeJS.WriteStream;
    write: (data: string) => void;
    columns: number;
    rows: number;
  };
}
