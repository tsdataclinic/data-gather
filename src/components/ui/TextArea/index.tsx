import classNames from 'classnames';
import type { ChangeEvent, KeyboardEvent } from 'react';

type Props = {
  className?: string;
  id?: string;
  onChange: (val: string, event: ChangeEvent<HTMLTextAreaElement>) => void;

  /**
   * Triggered when the 'Enter' key is pressed.
   */
  onEnterPress?: (
    val: string,
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => void;
  value: string;
};

export default function TextArea({
  className,
  id,
  onChange,
  onEnterPress,
  value,
}: Props): JSX.Element {
  const onTextChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    if (onChange) {
      onChange(event.currentTarget.value, event);
    }
  };

  const onKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress(value, event);
    }
  };

  const textareaClassName = classNames(
    className,
    'p-4 rounded-sm border border-gray-400',
  );

  return (
    <textarea
      id={id}
      className={textareaClassName}
      onChange={onTextChange}
      onKeyPress={onKeyPress}
      value={value}
    />
  );
}
