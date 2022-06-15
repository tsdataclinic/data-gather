import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default function Button({ children, onClick }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="py-2 px-4 text-white bg-blue-400 hover:bg-blue-500 active:bg-blue-400 rounded transition-colors"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
