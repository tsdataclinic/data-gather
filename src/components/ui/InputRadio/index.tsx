import 'styled-components/macro';

type Props = {
  name?: string;
  options: Array<{ displayValue: string; value: any }>;
};

export default function InputRadio({ name, options }: Props): JSX.Element {
  return (
    <>
      {options.map(({ value, displayValue }) => (
        <>
          <input type="radio" id={value} name={name} value={value} />
          <label htmlFor={value}>{displayValue}</label>
        </>
      ))}
    </>
  );
}
