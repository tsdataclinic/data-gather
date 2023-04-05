import * as React from 'react';
import classNames from 'classnames';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../ui/Button';

type Props = {
  hideConditionGroupButton?: boolean;
  hideRemoveConditionGroupButton?: boolean;
  onAddCondition: () => void;
  onAddConditionGroup?: () => void;
  onDeleteConditionGroup?: () => void;
};

function StyledButton({
  onClick,
  children,
  useDangerColor = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  useDangerColor?: boolean;
}): JSX.Element {
  const buttonClassName = classNames(
    'text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700',
    {
      'hover:text-gray-700': !useDangerColor,
      'hover:text-red-500': useDangerColor,
    },
  );
  return (
    <Button className={buttonClassName} unstyled onClick={onClick}>
      {children}
    </Button>
  );
}

export default function AddConditionButtons({
  onAddCondition,
  onAddConditionGroup,
  onDeleteConditionGroup,
  hideConditionGroupButton = false,
  hideRemoveConditionGroupButton = false,
}: Props): JSX.Element {
  return (
    <div className="space-x-3">
      <StyledButton onClick={onAddCondition}>+ Add condition</StyledButton>
      {hideConditionGroupButton ? null : (
        <StyledButton onClick={onAddConditionGroup}>
          + Add condition group
        </StyledButton>
      )}
      {hideConditionGroupButton || hideRemoveConditionGroupButton ? null : (
        <StyledButton useDangerColor onClick={onDeleteConditionGroup}>
          <span className="flex items-center space-x-1">
            <FontAwesomeIcon
              style={{ position: 'relative', top: 1 }}
              size="xs"
              icon={IconType.faX}
            />
            <span>Remove group</span>
          </span>
        </StyledButton>
      )}
    </div>
  );
}
