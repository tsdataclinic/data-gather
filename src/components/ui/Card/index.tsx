import classNames from 'classnames';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
  className?: string;
  linkTo?: string;
  shadow?:
    | 'small'
    | 'normal'
    | 'medium'
    | 'large'
    | 'xl'
    | '2xl'
    | 'inner'
    | 'none';
};

export default function Card({
  children,
  className,
  linkTo,
  shadow = 'normal',
}: Props): JSX.Element {
  const additionalClassNames = classNames(className, {
    'shadow hover:shadow-md': shadow === 'normal',
    'shadow-2xl': shadow === '2xl',
    'shadow-inner': shadow === 'inner',
    'shadow-lg hover:shadow-xl': shadow === 'large',
    'shadow-md hover:shadow-lg': shadow === 'medium',
    'shadow-none': shadow === 'none',
    'shadow-sm hover:shadow': shadow === 'small',
    'shadow-xl hover:shadow-2xl': shadow === 'xl',
  });

  const cardElt = (
    <div
      className={`p-4 bg-white border-gray-300 border transition-shadow ${additionalClassNames}`}
    >
      {children}
    </div>
  );

  if (linkTo === undefined) {
    return cardElt;
  }

  return (
    <Link className="block" to={linkTo}>
      {cardElt}
    </Link>
  );
}
