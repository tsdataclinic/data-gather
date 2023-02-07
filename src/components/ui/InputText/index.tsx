import * as React from 'react';
import 'styled-components/macro';
import classNames from 'classnames';
import useComposedRefs from '../../../hooks/useComposedRefs';

type Props = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  name?: string;

  onChange?: (val: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Triggered when the 'Enter' key is pressed.
   */
  onEnterPress?: (
    val: string,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
  value?: string;
};

function BaseInputText(
  {
    className,
    disabled,
    id,
    name,
    onChange,
    onEnterPress,
    placeholder,
    required,
    defaultValue,
    value,
    type = 'text',
  }: Props,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const combinedRefs = useComposedRefs(inputRef, forwardedRef);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event.currentTarget.value, event);
    }
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && onEnterPress) {
      if (inputRef.current) {
        onEnterPress(inputRef.current.value, event);
      }
    }
  };

  const inputClassName = classNames(
    className,
    'rounded-sm border border-gray-400 p-2 px-3',
  );

  return (
    <input
      ref={combinedRefs}
      name={name}
      disabled={disabled}
      id={id}
      required={required}
      type={type}
      className={inputClassName}
      onChange={onInputChange}
      onKeyPress={onKeyPress}
      defaultValue={defaultValue}
      value={value}
      placeholder={placeholder}
      css={`
        &:disabled {
          color: #94a3b8; // slate-400
          cursor: not-allowed;
        }
      `}
      pattern={
        type === 'tel'
          ? // this chaotic regex comes from
            // https://stackoverflow.com/questions/13719367/what-is-the-best-regular-expression-for-phone-numbers
            '^(?:\\+\\d{1,3}|0\\d{1,3}|00\\d{1,2})?(?:\\s?\\(\\d+\\))?(?:[-\\/\\s.]|\\d)+$'
          : undefined
      }
      minLength={type === 'tel' ? 3 : undefined}
    />
  );
}

const InputText = React.forwardRef<HTMLInputElement, Props>(BaseInputText);

export default InputText;
