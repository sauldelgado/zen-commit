import React from 'react';
import { render } from 'ink-testing-library';
import { Input } from '@ui/components';

describe('Input Component', () => {
  it('should render with placeholder', () => {
    const { lastFrame } = render(<Input placeholder="Enter text" value="" onChange={() => {}} />);

    expect(lastFrame()).toContain('Enter text');
  });

  it('should render with value', () => {
    const { lastFrame } = render(<Input value="Hello World" onChange={() => {}} />);

    expect(lastFrame()).toContain('Hello World');
  });

  it('should call onChange when input changes', () => {
    const handleChange = jest.fn();
    const { stdin } = render(<Input value="" onChange={handleChange} />);

    stdin.write('a');
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('should call onSubmit when Enter is pressed', () => {
    const handleSubmit = jest.fn();
    const { stdin } = render(<Input value="Hello" onChange={() => {}} onSubmit={handleSubmit} />);

    stdin.write('\r');
    expect(handleSubmit).toHaveBeenCalledWith('Hello');
  });
});
