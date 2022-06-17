import classNames from 'classnames';
import type { ChangeEvent, KeyboardEvent } from 'react';

type Props = {
  className?: string;
  id?: string;
  name?: string;
  onChange: (val: string, event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Triggered when the 'Enter' key is pressed.
   */
  onEnterPress?: (val: string, event: KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  value: string;
};

export default function InputText({
  className,
  id,
  name,
  onChange,
  onEnterPress,
  required,
  value,
}: Props): JSX.Element {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event.currentTarget.value, event);
    }
  };

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress(value, event);
    }
  };

  const inputClassName = classNames(
    className,
    'p-4 rounded-sm border border-gray-400',
  );

  return (
    <input
      name={name}
      id={id}
      required={required}
      type="text"
      className={inputClassName}
      onChange={onInputChange}
      onKeyPress={onKeyPress}
      value={value}
    />
  );
}
