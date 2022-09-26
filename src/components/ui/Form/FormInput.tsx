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
  label: string;
  name: string;
  size?: 'normal' | 'large';
  value?: string;
};

export default function FormInput({
  className,
  label,
  name,
  defaultValue,
  value,
  size = 'normal',
}: Props): JSX.Element {
  const [val, setVal] = useState(value);
  return (
    <LabelWrapper className={className} label={label}>
      <InputText
        name={name}
        defaultValue={defaultValue || ''}
        value={val}
        onChange={setVal}
        size={size}
        required
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
