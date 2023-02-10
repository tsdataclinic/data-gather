import * as React from 'react';
import LabelWrapper from '../LabelWrapper';
import Dropdown from '../Dropdown';

type Props<T extends string> = {
  className?: string;
  defaultValue?: T;
  helperText?: string;
  label: string;
  name: string;
  onChange?: (value: T) => void;
  options: ReadonlyArray<{
    displayValue: React.ReactNode;
    value: T;
  }>;
  placeholder?: string;
  required?: boolean;
  value?: T;
};

export default function FormDropdown<T extends string>({
  className,
  defaultValue,
  value,
  label,
  name,
  options,
  helperText,
  onChange,
  placeholder,
  required = true,
}: Props<T>): JSX.Element {
  return (
    <LabelWrapper
      helperText={helperText}
      className={className}
      label={label + (required ? ' *' : '')}
    >
      <Dropdown
        options={options}
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </LabelWrapper>
  );
}
