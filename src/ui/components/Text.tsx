import React, { ReactNode } from 'react';
// Use React.createElement directly instead of importing from Ink
const InkText = (props: any) => {
  return React.createElement('span', props, props.children);
};

// Define our own TextProps
export interface TextProps {
  children?: ReactNode;
  bold?: boolean;
  color?: string;
  dim?: boolean;
  italic?: boolean;
  [key: string]: any; // Allow other props
}

/**
 * A component for displaying text
 */
const Text: React.FC<TextProps> = ({ children, ...props }) => {
  return <InkText {...props}>{children}</InkText>;
};

export default Text;
