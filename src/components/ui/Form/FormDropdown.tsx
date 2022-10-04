import * as React from 'react';
import LabelWrapper from '../LabelWrapper';
import Dropdown from '../Dropdown';

type Props<T extends string> = {
  className?: string;
  defaultValue?: T;
  label: string;
  name: string;
  options: ReadonlyArray<{
    displayValue: React.ReactNode;
    value: T;
  }>;
};

// TODO: add support for controlled values
export default function FormDropdown<T extends string>({
  className,
  defaultValue,
  label,
  name,
  options,
}: Props<T>): JSX.Element {
  return (
    <LabelWrapper className={className} label={label}>
      <Dropdown options={options} name={name} defaultValue={defaultValue} />
    </LabelWrapper>
  );
}
