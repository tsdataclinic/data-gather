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
  label: string;
  name: string;
};

export default function FormInput({ label, name }: Props): JSX.Element {
  const [val, setVal] = useState('');
  return (
    <LabelWrapper label={label}>
      <InputText name={name} value={val} onChange={setVal} required />
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
