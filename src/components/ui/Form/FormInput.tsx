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
  helperText?: string;
  infoTooltip?: string;
  inputClassName?: string;
  label?: string;
  name: string;
  onChange?: (val: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  options?: ReadonlyArray<{ displayValue: string; value: string | boolean }>;
  required?: boolean;
  type?: 'text' | 'radio' | 'number' | 'email' | 'tel';
  value?: string;
};

export default function FormInput({
  className,
  inputClassName,
  label,
  helperText,
  infoTooltip,
  name,
  defaultValue,
  value,
  onChange,
  disabled = false,
  required = true,
  type = 'text',
  options = [],
}: Props): JSX.Element {
  const finalInputClassName = classNames('w-full', inputClassName);

  // TODO: Refactor these into separate components so that props are more sensible.
  switch (type) {
    case 'radio':
      return (
        <InputRadioGroup
          label={label}
          helperText={helperText}
          name={name}
          options={options}
        />
      );
    case 'number':
      return (
        <LabelWrapper
          className={className}
          label={label + (required ? ' *' : '')}
          helperText={helperText}
          infoTooltip={infoTooltip}
        >
          <InputNumber
            required={required}
            disabled={disabled}
            className={finalInputClassName}
            name={name}
          />
        </LabelWrapper>
      );
    case 'tel':
    case 'text':
    case 'email':
      return (
        <LabelWrapper
          className={className}
          label={label + (required ? ' *' : '')}
          helperText={helperText}
          infoTooltip={infoTooltip}
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
