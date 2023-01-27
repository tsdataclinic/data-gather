import 'styled-components/macro';

type Props = {
  helperText?: string;
  label?: string;
  name?: string;
  options: ReadonlyArray<{ displayValue: string; value: any }>;
};

export default function InputRadioGroup({
  name,
  label,
  helperText,
  options,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="mb-2">
        {label}
        {helperText && (
          <div className="mb-2">
            <small>{helperText}</small>
          </div>
        )}
      </div>
      {options.map(({ value, displayValue }) => (
        <div key={value}>
          <input type="radio" id={value} name={name} value={value} />
          <label className="ml-2" htmlFor={value}>
            {displayValue}
          </label>
        </div>
      ))}
    </div>
  );
}
