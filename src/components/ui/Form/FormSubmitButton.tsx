import type { ReactNode } from 'react';
import Button from '../Button';

type Props = {
  children?: ReactNode;
  className?: string;
};

export default function FormSubmit({
  className,
  children = 'Submit',
}: Props): JSX.Element {
  return (
    <Button className={className} type="submit">
      {children}
    </Button>
  );
}
