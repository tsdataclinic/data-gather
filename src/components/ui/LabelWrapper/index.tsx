import classNames from 'classnames';
import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
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
  htmlFor,
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

  let labelComponent = null;
  if (htmlFor) {
    // if an `htmlFor` id is specified then we shouldn't nest the children
    // inside the label
    labelComponent = (
      <div className={inline ? 'space-x-4' : 'space-y-1'}>
        {labelAfter ? childrenBlock : null}
        <label htmlFor={htmlFor}>
          <div className={spanClassName} style={labelTextStyle}>
            {label}
          </div>
        </label>
        {labelAfter ? null : childrenBlock}
      </div>
    );
  } else {
    // if an `htmlFor` id was not specified, then nest the children inside the
    // label so that the browser can associate them
    labelComponent = (
      <label className={inline ? 'space-x-4' : 'space-y-1'} htmlFor={htmlFor}>
        {labelAfter ? childrenBlock : null}
        <div className={spanClassName} style={labelTextStyle}>
          {label}
        </div>
        {labelAfter ? null : childrenBlock}
      </label>
    );
  }

  return <div className={className}>{labelComponent}</div>;
}
