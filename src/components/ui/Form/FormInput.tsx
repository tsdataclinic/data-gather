import classNames from 'classnames';
import * as React from 'react';
import InputNumber from '../InputNumber';
import InputRadio from '../InputRadio';
import InputText from '../InputText';
import LabelWrapper from '../LabelWrapper';

type Props = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  inputClassName?: string;
  label?: string;
  name: string;
  onChange?: (val: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  options?: Array<{ displayValue: string; value: string | boolean }>;
  required?: boolean;
  type?: 'text' | 'radio' | 'number';
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
  type = 'text',
  options = [],
}: Props): JSX.Element {
  const finalInputClassName = classNames('w-full', inputClassName);

  switch (type) {
    case 'radio':
      return <InputRadio label={label} name={name} options={options} />;
    case 'number':
      return (
        <LabelWrapper
          className={className}
          label={label + (required ? ' *' : '')}
        >
          <InputNumber
            required={required}
            disabled={disabled}
            className={finalInputClassName}
            name={name}
          />
        </LabelWrapper>
      );
    case 'text':
    default:
      return (
        <LabelWrapper
          className={className}
          label={label + (required ? ' *' : '')}
        >
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
}
