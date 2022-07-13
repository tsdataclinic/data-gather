import classNames from 'classnames';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
};

export default function Button({
  children,
  className,
  onClick,
  type = 'button',
}: Props): JSX.Element {
  const buttonClassName = classNames(
    className,
    'py-2 px-4 text-white bg-blue-400 hover:bg-blue-500 active:bg-blue-400 rounded transition-colors block',
  );

  return (
    // disable button-has-type lint because we're receiving the type
    // correctly from the `type` prop
    // eslint-disable-next-line react/button-has-type
    <button type={type} className={buttonClassName} onClick={onClick}>
      {children}
    </button>
  );
}
