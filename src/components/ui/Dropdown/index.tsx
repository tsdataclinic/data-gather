import { useId } from '@reach/auto-id';
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from '@reach/listbox';
import VisuallyHidden from '@reach/visually-hidden';
import { useMemo } from 'react';
import styled from 'styled-components/macro';
import type { ReactNode } from 'react';
import '@reach/listbox/styles.css';

type Props = {
  ariaLabel?: string;

  /**
   * The button label to display when no option is selected.
   * This will also be the default value for `ariaLabel` too.
   */
  defaultButtonLabel: string;
  onChange: (value: string | undefined) => void;
  options: ReadonlyArray<{
    displayValue: ReactNode;
    value: string;
  }>;
  value: string | undefined;
};

const StyledListboxOption = styled(ListboxOption)`
  padding: 0.25rem 1rem;
`;

const StyledListboxButton = styled(ListboxButton)`
  background-color: white;
  border-radius: 0.125rem;
  padding: 0.25rem 1rem;
`;

export default function Dropdown({
  ariaLabel,
  defaultButtonLabel,
  onChange,
  options,
  value,
}: Props): JSX.Element {
  const ariaLabelToUse = ariaLabel ?? defaultButtonLabel;
  const labelId = `dropdown-label--${useId()}`;

  const listboxOptions = useMemo(
    () =>
      options.map(obj => (
        <StyledListboxOption key={obj.value} value={obj.value}>
          {obj.displayValue}
        </StyledListboxOption>
      )),
    [options],
  );

  return (
    <>
      <VisuallyHidden id={labelId}>{ariaLabelToUse}</VisuallyHidden>
      <ListboxInput aria-labelledby={labelId} value={value} onChange={onChange}>
        {value === undefined ? (
          <StyledListboxButton arrow>{defaultButtonLabel}</StyledListboxButton>
        ) : (
          <StyledListboxButton arrow />
        )}
        <ListboxPopover style={{ marginTop: 4 }}>
          <ListboxList>{listboxOptions}</ListboxList>
        </ListboxPopover>
      </ListboxInput>
    </>
  );
}
