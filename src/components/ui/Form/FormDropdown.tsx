import * as React from 'react';
import LabelWrapper from '../LabelWrapper';
import Dropdown from '../Dropdown';

// TODO: add a required prop to this and `Dropdown`. Make it default to true
// in FormDropdown.
type Props<T extends string> = {
  className?: string;
  defaultValue?: T;
  label: string;
  name: string;
  onChange?: (value: T) => void;
  options: ReadonlyArray<{
    displayValue: React.ReactNode;
    value: T;
  }>;
  placeholder?: string;
  value?: T;
};

export default function FormDropdown<T extends string>({
  className,
  defaultValue,
  value,
  label,
  name,
  options,
  onChange,
  placeholder,
}: Props<T>): JSX.Element {
  return (
    <LabelWrapper className={className} label={label}>
      <Dropdown
        options={options}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </LabelWrapper>
  );
}
