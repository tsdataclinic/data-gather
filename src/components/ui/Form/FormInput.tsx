import classNames from 'classnames';
import * as React from 'react';
import InputText from '../InputText';
import LabelWrapper from '../LabelWrapper';

type Props = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  inputClassName?: string;
  label: string;
  name: string;
  onChange?: (val: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: string;
};

export default function FormInput({
  className,
  inputClassName,
  disabled = false,
  required = true,
  label,
  name,
  defaultValue,
  value,
  onChange,
}: Props): JSX.Element {
  const finalInputClassName = classNames('w-full', inputClassName);

  return (
    <LabelWrapper className={className} label={label + (required ? ' *' : '')}>
      <InputText
        required={required}
        disabled={disabled}
        className={finalInputClassName}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </LabelWrapper>
  );
}
