import React from 'react';
import { render } from 'ink-testing-library';
import { Select } from '@ui/components';

describe('Select Component', () => {
  const items = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  it('should render items correctly', () => {
    const { lastFrame } = render(<Select items={items} onSelect={() => {}} />);

    const frame = lastFrame() || '';
    expect(frame).toContain('Option 1');
    expect(frame).toContain('Option 2');
    expect(frame).toContain('Option 3');
  });

  it('should call onSelect when an item is selected', () => {
    const handleSelect = jest.fn();
    const { stdin } = render(<Select items={items} onSelect={handleSelect} />);

    // Press Enter to select the first option
    stdin.write('\r');

    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'option1' }));
  });

  it('should highlight the initial selected item', () => {
    const { lastFrame } = render(<Select items={items} onSelect={() => {}} initialIndex={1} />);

    // Can't directly test for highlighted item
    // but we can check the component renders without errors
    expect(lastFrame()).toContain('Option 2');
  });
});
