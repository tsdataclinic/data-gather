import * as React from 'react';

type Props = {
  children: React.ReactNode;
  label: string;
};

export default function FormGroup({ children, label }: Props): JSX.Element {
  return (
    <div className="flex w-full space-x-4 divide-x-2 divide-neutral-300">
      <p className="w-1/4">{label}</p>
      <div className="space-y-4 pl-4">{children}</div>
    </div>
  );
}
