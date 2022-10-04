import classNames from 'classnames';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  intent?: 'primary' | 'danger' | 'default';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';

  /**
   * Render the button in different default styles.
   * - `full`: Render the button with 100% width in its container and sharp edges.
   */
  variant?: 'normal' | 'full';
};

export default function Button({
  children,
  className,
  onClick,
  type = 'button',
  variant = 'normal',
  intent = 'default',
}: Props): JSX.Element {
  const buttonClassName = classNames(
    className,
    'py-2 px-4 transition-colors block focus-visible:outline-fuchsia-700 duration-200',
    {
      rounded: variant === 'normal',
      'w-full rounded-none': variant === 'full',
      'bg-blue-500 hover:bg-blue-400 active:bg-blue-500 text-white':
        intent === 'primary',
      'bg-red-500 hover:bg-red-400 active:bg-red-500 text-white':
        intent === 'danger',
      'bg-white hover:bg-gray-100 active:bg-white text-black border border-gray-400':
        intent === 'default',
    },
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
