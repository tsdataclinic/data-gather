import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  label: string;
};

/**
 * This is a lightweight component to just wrap a component with a
 * label and add a little spacing.
 */
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
