import React, { useState, useEffect } from 'react';
import { Box, Text } from './';

export interface SpinnerProps {
  text?: string;
  type?: 'dots' | 'line' | 'clock';
}

/**
 * A spinner component for loading states
 */
const Spinner: React.FC<SpinnerProps> = ({ 
  text, 
  type = 'dots',
}) => {
  const [frame, setFrame] = useState(0);
  
  const frames = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['–', '\\', '|', '/'],
    clock: ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'],
  };
  
  const spinnerFrames = frames[type];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % spinnerFrames.length);
    }, 80);
    
    return () => {
      clearInterval(timer);
    };
  }, [spinnerFrames.length]);
  
  return (
    <Box>
      <Text>{spinnerFrames[frame]} </Text>
      {text && <Text>{text}</Text>}
    </Box>
  );
};

export default Spinner;