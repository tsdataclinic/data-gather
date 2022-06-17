import Button from '../Button';
import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export default function FormSubmit({
  children = 'Submit',
}: Props): JSX.Element {
  return <Button type="submit">{children}</Button>;
}
