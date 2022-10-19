import 'styled-components/macro';

type Props = {
  label?: string;
  name?: string;
  options: Array<{ displayValue: string; value: any }>;
};

export default function InputRadio({
  name,
  label,
  options,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="mb-2">{label}</div>
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
