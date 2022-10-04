import classNames from 'classnames';
import {
  useState,
  isValidElement,
  ReactElement,
  ReactNode,
  JSXElementConstructor,
} from 'react';
import InputText from '../InputText';
import LabelWrapper from '../LabelWrapper';

type Props = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  inputClassName?: string;
  label: string;
  name: string;
  value?: string;
};

export default function FormInput({
  className,
  inputClassName,
  disabled = false,
  label,
  name,
  defaultValue,
  value,
}: Props): JSX.Element {
  const [val, setVal] = useState(value);
  const finalInputClassName = classNames('w-full', inputClassName);

  return (
    <LabelWrapper className={className} label={label}>
      <InputText
        required
        disabled={disabled}
        className={finalInputClassName}
        name={name}
        defaultValue={defaultValue || ''}
        value={val}
        onChange={setVal}
      />
    </LabelWrapper>
  );
}

export function isFormInput(
  elt: ReactNode,
): elt is ReactElement<Props, JSXElementConstructor<Props>> {
  if (isValidElement(elt)) {
    return elt.type === FormInput;
  }
  return false;
}
