import classNames from 'classnames';
import { ChangeEvent, KeyboardEvent, useRef } from 'react';

type Props = {
  className?: string;
  defaultValue?: string;
  id?: string;
  name?: string;

  onChange: (val: string, event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Triggered when the 'Enter' key is pressed.
   */
  onEnterPress?: (val: string, event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  size?: 'normal' | 'large';
  value?: string;
};

export default function InputText({
  className,
  id,
  name,
  onChange,
  onEnterPress,
  placeholder,
  required,
  size = 'normal',
  defaultValue,
  value,
}: Props): JSX.Element {
  const valueRef = useRef<HTMLInputElement | null>(null);
  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event.currentTarget.value, event);
    }
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && onEnterPress) {
      if (valueRef.current) {
        onEnterPress(valueRef.current.value, event);
      }
    }
  };

  const inputClassName = classNames(
    className,
    'rounded-sm border border-gray-400',
    {
      'p-1 px-3': size === 'normal',
      'p-4': size === 'large',
    },
  );

  return (
    <input
      ref={valueRef}
      name={name}
      id={id}
      required={required}
      type="text"
      className={inputClassName}
      onChange={onInputChange}
      onKeyPress={onKeyPress}
      defaultValue={defaultValue}
      value={value}
      placeholder={placeholder}
    />
  );
}
