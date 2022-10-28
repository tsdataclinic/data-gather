import 'styled-components/macro';
import classNames from 'classnames';

type Props = {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  value?: number;
};

export default function InputNumber({
  className,
  defaultValue,
  disabled,
  id,
  name,
  placeholder,
  required,
  value,
}: Props): JSX.Element {
  const inputClassName = classNames(
    className,
    'rounded-sm border border-gray-400 p-2 px-3',
  );

  return (
    <input
      name={name}
      disabled={disabled}
      id={id}
      required={required}
      type="number"
      className={inputClassName}
      defaultValue={defaultValue}
      value={value}
      placeholder={placeholder}
      css={`
        &:disabled {
          color: #94a3b8; // slate-400
          cursor: not-allowed;
        }
      `}
    />
  );
}
