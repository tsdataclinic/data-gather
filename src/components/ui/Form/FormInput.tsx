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
  fullWidth?: boolean;
  label: string;
  name: string;
  value?: string;
};

export default function FormInput({
  className,
  label,
  name,
  defaultValue,
  value,
  fullWidth = false,
}: Props): JSX.Element {
  const [val, setVal] = useState(value);
  return (
    <LabelWrapper className={className} label={label}>
      <InputText
        required
        name={name}
        defaultValue={defaultValue || ''}
        value={val}
        onChange={setVal}
        className={fullWidth ? 'w-full' : undefined}
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
