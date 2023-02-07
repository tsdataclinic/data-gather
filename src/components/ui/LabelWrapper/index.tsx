import classNames from 'classnames';
import type { ReactNode, CSSProperties } from 'react';
import InfoIcon from '../InfoIcon';

type Props = {
  children: ReactNode;
  className?: string;
  helperText?: string;
  htmlFor?: string;
  infoTooltip?: string;
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
  helperText,
  labelAfter = false,
  labelTextClassName,
  labelTextStyle,
  infoTooltip,
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

  const tooltipIcon = infoTooltip ? <InfoIcon tooltip={infoTooltip} /> : null;

  let labelComponent = null;
  if (htmlFor) {
    // if an `htmlFor` id is specified then we shouldn't nest the children
    // inside the label
    labelComponent = (
      <div className={inline ? 'space-x-2' : 'space-y-1'}>
        {labelAfter ? childrenBlock : null}
        <label htmlFor={htmlFor}>
          <div className={spanClassName} style={labelTextStyle}>
            {label} {tooltipIcon}
          </div>
          {helperText && (
            <div className={spanClassName} style={labelTextStyle}>
              <small>
                <i>{helperText}</i>
              </small>
            </div>
          )}
        </label>
        {labelAfter ? null : childrenBlock}
      </div>
    );
  } else {
    // if an `htmlFor` id was not specified, then nest the children inside the
    // label so that the browser can associate them
    labelComponent = (
      <label className={inline ? 'space-x-2' : 'space-y-1'} htmlFor={htmlFor}>
        {labelAfter ? childrenBlock : null}
        <div className={spanClassName} style={labelTextStyle}>
          {label} {tooltipIcon}
          {helperText && (
            <div className={spanClassName} style={labelTextStyle}>
              <small>
                <i>{helperText}</i>
              </small>
            </div>
          )}
        </div>
        {labelAfter ? null : childrenBlock}
      </label>
    );
  }

  return <div className={className}>{labelComponent}</div>;
}
