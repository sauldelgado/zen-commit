import React, { ReactNode } from 'react';
// Use React.createElement directly instead of importing from Ink
const InkBox = (props: any) => {
  return React.createElement('div', props, props.children);
};
const InkText = (props: any) => {
  return React.createElement('span', props, props.children);
};

// Define our own BoxProps since we're having issues with importing it from ink
export interface BoxProps {
  children?: ReactNode;
  padding?: number;
  margin?: number;
  borderStyle?: string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  marginY?: number;
  marginTop?: number;
  marginBottom?: number;
  [key: string]: any; // Allow other props
}

/**
 * A container component for layout
 */
const Box: React.FC<BoxProps> & {
  Text: typeof InkText;
} = ({ children, ...props }) => {
  return <InkBox {...props}>{children}</InkBox>;
};

// Attach Text component for convenience
Box.Text = InkText;

export default Box;
