import classNames from 'classnames';
import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  intent?: 'primary' | 'danger' | 'default';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: 'medium' | 'small';
  type?: 'button' | 'submit';

  unstyled?: boolean;
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
  unstyled = false,
  size = 'medium',
}: Props): JSX.Element {
  const buttonClassName = classNames(
    className,
    'focus-visible:outline-fuchsia-700',
    unstyled
      ? undefined
      : {
          'transition-colors duration-200': true,
          'py-2 px-4': size === 'medium',
          'py-1 px-2': size === 'small',
          // variant-dependent styles
          rounded: variant === 'normal',
          'w-full rounded-none': variant === 'full',

          // intent-dependent styles (only apply if our variant isn't "unstyled")
          'bg-blue-500 hover:bg-blue-400 active:bg-blue-500 text-white':
            intent === 'primary',
          'bg-red-500 hover:bg-red-400 active:bg-red-500 text-white':
            intent === 'danger',
          'bg-gray-200 hover:bg-gray-300 active:bg-gray-200 text-gray-800 hover:text-gray-900':
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
