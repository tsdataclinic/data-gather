import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import styled from 'styled-components/macro';
import type { ReactNode } from 'react';
import '@reach/listbox/styles.css';
import * as Select from '@radix-ui/react-select';

type Props<T> = {
  ariaLabel?: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<{
    displayValue: ReactNode;
    value: T;
  }>;

  /**
   * The button label to display when no option is selected.
   * This will also be the default value for `ariaLabel` too.
   */
  placeholder: string;
  value: T | undefined;
};

const StyledTriggerButton = styled(Select.Trigger)`
  all: unset;
  border-radius: 4px;

  // create a border using box-shadow. We aren't using border because a border
  // affects the dimensions
  box-shadow: 0 0 0 1px #a3a3a3;
  padding: 4px 15px;

  &:hover {
    background-color: #f5f5f5;
  }

  &:focus {
    // blue outline on focus
    box-shadow: 0 0 0 2px #3b82f6;
  }
`;

const StyledSelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  overflow: hidden;
`;

const StyledSelectViewport = styled(Select.Viewport)`
  padding: 5px;
`;

const StyledSelectItem = styled(Select.Item)`
  align-items: center;
  all: unset;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  padding: 4px 35px 4px 25px;
  position: relative;
  user-select: none;

  &[data-highlighted] {
    color: white;
    background: #3b82f6;
  },
`;

const StyledItemIndicator = styled(Select.ItemIndicator)`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 100%;
  left: 0;
  position: absolute;
  width: 25px;
  top: 0;
`;

export default function Dropdown<T extends string>({
  ariaLabel,
  placeholder,
  onChange,
  options,
  value,
}: Props<T>): JSX.Element {
  const ariaLabelToUse = ariaLabel ?? placeholder;
  const selectItems = useMemo(
    () =>
      options.map(obj => (
        <StyledSelectItem key={obj.value} value={obj.value}>
          <Select.ItemText>{obj.displayValue}</Select.ItemText>
          <StyledItemIndicator>
            <FontAwesomeIcon icon={IconType.faCheck} size="sm" />
          </StyledItemIndicator>
        </StyledSelectItem>
      )),
    [options],
  );

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <StyledTriggerButton aria-label={ariaLabelToUse}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <FontAwesomeIcon
            style={{ marginLeft: 8 }}
            icon={IconType.faChevronDown}
            size="xs"
          />
        </Select.Icon>
      </StyledTriggerButton>

      <Select.Portal>
        <StyledSelectContent>
          <StyledSelectViewport>{selectItems}</StyledSelectViewport>
        </StyledSelectContent>
      </Select.Portal>
    </Select.Root>
  );
}
