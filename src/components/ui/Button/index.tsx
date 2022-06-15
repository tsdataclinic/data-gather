import classNames from 'classnames';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default function Button({
  children,
  className,
  onClick,
}: Props): JSX.Element {
  const buttonClassName = classNames(
    className,
    'py-2 px-4 text-white bg-blue-400 hover:bg-blue-500 active:bg-blue-400 rounded transition-colors',
  );

  return (
    <button type="button" className={buttonClassName} onClick={onClick}>
      {children}
    </button>
  );
}
