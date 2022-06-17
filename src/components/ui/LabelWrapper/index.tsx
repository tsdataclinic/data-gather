import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  label: string;
};

export default function LabelWrapper({ children, label }: Props): JSX.Element {
  return (
    <div>
      <label>
        <span className="mr-4">{label}</span>
        {children}
      </label>
    </div>
  );
}
