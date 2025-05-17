import { FC, ComponentType, ReactElement } from 'react';

export interface ItemOfSelectInput {
  label: string;
  value: any;
  key?: string | number | undefined;
}

export interface SelectInputProps<T extends ItemOfSelectInput = ItemOfSelectInput> {
  focus?: boolean | undefined;
  indicatorComponent?: ComponentType<any> | undefined;
  itemComponent?: ComponentType<any> | undefined;
  items?: readonly T[] | undefined;
  limit?: number | undefined;
  initialIndex?: number | undefined;
  onSelect?: ((item: T) => void) | undefined;
}

declare const SelectInput: FC<SelectInputProps>;

export default SelectInput;
