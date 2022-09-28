import classNames from 'classnames';
import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  inline?: boolean;
  inlineContainerStyles?: CSSProperties;
  label: string;
  labelAfter?: boolean;
  labelTextClassName?: string;
  labelTextStyle?: CSSProperties;
};

/**
 * This is a lightweight component to just wrap a component with a
 * label and add a little spacing.
 */
export default function LabelWrapper({
  className,
  children,
  inline = false,
  inlineContainerStyles,
  label,
  labelAfter = false,
  labelTextClassName,
  labelTextStyle,
}: Props): JSX.Element {
  const childrenBlock = inline ? (
    <div className="inline-block" style={inlineContainerStyles}>
      {children}
    </div>
  ) : (
    children
  );

  const spanClassName = classNames(labelTextClassName, {
    'inline-block': inline,
  });

  return (
    <div className={className}>
      <label className="space-x-4">
        {labelAfter ? childrenBlock : null}
        <span className={spanClassName} style={labelTextStyle}>
          {label}
        </span>
        {labelAfter ? null : childrenBlock}
      </label>
    </div>
  );
}
