import type { ReactNode } from 'react';
import Button from '../Button';

type Props = {
  children?: ReactNode;
};

export default function FormSubmit({
  children = 'Submit',
}: Props): JSX.Element {
  return <Button type="submit">{children}</Button>;
}
