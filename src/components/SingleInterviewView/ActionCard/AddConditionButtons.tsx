import * as React from 'react';
import Button from '../../ui/Button';

type Props = {
  onAddCondition: () => void;
  onAddConditionGroup: () => void;
};

function StyledButton({
  onClick,
  children,
}: {
  children: React.ReactNode;
  onClick: () => void;
}): JSX.Element {
  return (
    <Button
      className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
      unstyled
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default function AddConditionButtons({
  onAddCondition,
  onAddConditionGroup,
}: Props): JSX.Element {
  return (
    <div className="space-x-2">
      <StyledButton onClick={onAddCondition}>+ Add condition</StyledButton>
      <StyledButton onClick={onAddConditionGroup}>
        + Add condition group
      </StyledButton>
    </div>
  );
}
