import type { ReactNode } from 'react';
import Button from '../Button';

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

type Props = {
  children?: ReactNode;
  intent?: ButtonProps['intent'];
} & Omit<ButtonProps, 'children' | 'intent'>;

export default function FormSubmit({
  children = 'Submit',
  intent = 'primary',
  ...passThroughProps
}: Props): JSX.Element {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button type="submit" intent={intent} {...passThroughProps}>
      {children}
    </Button>
  );
}
