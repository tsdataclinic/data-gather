import classNames from 'classnames';
import * as React from 'react';
import assertUnreachable from '../../../util/assertUnreachable';
import InputNumber from '../InputNumber';
import InputRadioGroup from '../InputRadioGroup';
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
  options?: ReadonlyArray<{ displayValue: string; value: string | boolean }>;
  required?: boolean;
  type?: 'text' | 'radio' | 'number' | 'email';
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

  // TODO: Refactor these into separate components so that props are more sensible.
  switch (type) {
    case 'radio':
      return <InputRadioGroup label={label} name={name} options={options} />;
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
    case 'email':
      return (
        <LabelWrapper
          className={className}
          label={label + (required ? ' *' : '')}
        >
          <InputText
            type={type}
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
    default:
      assertUnreachable(type);
  }
}
