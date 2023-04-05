import classNames from 'classnames';
import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import SingleConditionRow from './SingleConditionRow';
import type { EditableEntryWithScreen } from '../types';
import AddConditionButtons from './AddConditionButtons';
import Dropdown from '../../ui/Dropdown';

type Props = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  conditionGroup: ConditionalAction.ConditionGroup;
  defaultLanguage: string;
  hideDeleteGroupButton?: boolean;
  onConditionGroupChange: (
    newConditionGroup: ConditionalAction.ConditionGroup,
  ) => void;
  onConditionGroupDelete?: (
    conditionGroupToDelete: ConditionalAction.ConditionGroup,
  ) => void;
};

const CONDITIONAL_GROUP_TYPE_OPTIONS = [
  { value: ConditionalAction.ConditionGroupType.AND, displayValue: 'And' },
  { value: ConditionalAction.ConditionGroupType.OR, displayValue: 'Or' },
];

function ConditionalGroupTypeDisplay({
  isEditable,
  conditionGroupType,
  onConditionGroupTypeChange,
}: {
  conditionGroupType: ConditionalAction.ConditionGroupType;
  isEditable: boolean;
  onConditionGroupTypeChange: (
    newGroupType: ConditionalAction.ConditionGroupType,
  ) => void;
}): JSX.Element {
  if (isEditable) {
    return (
      <Dropdown
        onChange={onConditionGroupTypeChange}
        options={CONDITIONAL_GROUP_TYPE_OPTIONS}
        value={conditionGroupType}
      />
    );
  }
  return <p className="ml-4 capitalize">{conditionGroupType}</p>;
}

export default function ConditionGroupBlock({
  allInterviewEntries,
  conditionGroup,
  defaultLanguage,
  onConditionGroupChange,
  onConditionGroupDelete,
  hideDeleteGroupButton = false,
}: Props): JSX.Element {
  const { type, conditions } = conditionGroup;

  const onDeleteThisConditionGroup = React.useCallback(() => {
    if (onConditionGroupDelete) {
      onConditionGroupDelete(conditionGroup);
    }
  }, [conditionGroup, onConditionGroupDelete]);

  const onConditionGroupTypeChange = React.useCallback(
    (newGroupType: ConditionalAction.ConditionGroupType) => {
      onConditionGroupChange({
        ...conditionGroup,
        type: newGroupType,
      });
    },
    [conditionGroup, onConditionGroupChange],
  );

  const onNestedConditionChange = React.useCallback(
    (
      newCondition:
        | ConditionalAction.SingleCondition
        | ConditionalAction.ConditionGroup,
    ): void => {
      onConditionGroupChange({
        ...conditionGroup,
        conditions: conditionGroup.conditions.map(condition =>
          condition.id === newCondition.id ? newCondition : condition,
        ),
      });
    },
    [conditionGroup, onConditionGroupChange],
  );

  const onNestedConditionDelete = React.useCallback(
    (
      conditionToDelete:
        | ConditionalAction.SingleCondition
        | ConditionalAction.ConditionGroup,
    ) => {
      onConditionGroupChange({
        ...conditionGroup,
        conditions: conditionGroup.conditions.filter(
          condition => condition.id !== conditionToDelete.id,
        ),
      });
    },
    [conditionGroup, onConditionGroupChange],
  );

  const onAddSingleCondition = React.useCallback(() => {
    onConditionGroupChange({
      ...conditionGroup,
      conditions: conditionGroup.conditions.concat(
        ConditionalAction.createDefaultSingleCondition(),
      ),
    });
  }, [conditionGroup, onConditionGroupChange]);

  const onAddConditionGroup = React.useCallback(() => {
    onConditionGroupChange({
      ...conditionGroup,
      conditions: conditionGroup.conditions.concat(
        ConditionalAction.createDefaultConditionGroup(),
      ),
    });
  }, [conditionGroup, onConditionGroupChange]);

  const conditionElts = conditions.map((condition, idx) => {
    const isSingleCondition = ConditionalAction.isSingleCondition(condition);
    const groupTypeClassName = classNames('w-20', {
      'pt-3': !isSingleCondition,
    });

    const containerClassName = classNames('flex space-x-2', {
      'items-center': isSingleCondition,
      'items-start': !isSingleCondition,
    });

    const groupTypeColumn =
      // only display the group type if we have more than 1 condition
      conditions.length > 1 ? (
        <div className={groupTypeClassName}>
          {/* the 1st item is an empty div just for spacing */}
          {idx === 0 ? null : (
            <ConditionalGroupTypeDisplay
              isEditable={idx === 1}
              conditionGroupType={conditionGroup.type}
              onConditionGroupTypeChange={onConditionGroupTypeChange}
            />
          )}
        </div>
      ) : null;

    return (
      <div key={condition.id} className={containerClassName}>
        {groupTypeColumn}
        {isSingleCondition ? (
          <SingleConditionRow
            condition={condition}
            allInterviewEntries={allInterviewEntries}
            defaultLanguage={defaultLanguage}
            onConditionChange={onNestedConditionChange}
            onConditionDelete={onNestedConditionDelete}
          />
        ) : (
          <ConditionGroupBlock
            allInterviewEntries={allInterviewEntries}
            conditionGroup={condition}
            defaultLanguage={defaultLanguage}
            onConditionGroupChange={onNestedConditionChange}
            onConditionGroupDelete={onNestedConditionDelete}
          />
        )}
      </div>
    );
  });

  const groupDescriptor =
    conditions.length > 1 ? (
      <p>
        {type === ConditionalAction.ConditionGroupType.AND
          ? 'All of the following are true'
          : 'Any of the following are true'}
      </p>
    ) : null;

  return (
    <div className="space-y-2 rounded border border-gray-300 bg-gray-100 p-3">
      {conditions.length === 0 ? <em>No conditions have been added.</em> : null}

      {groupDescriptor}
      <div className="space-y-2">{conditionElts}</div>
      <AddConditionButtons
        hideRemoveConditionGroupButton={hideDeleteGroupButton}
        onAddCondition={onAddSingleCondition}
        onAddConditionGroup={onAddConditionGroup}
        onDeleteConditionGroup={onDeleteThisConditionGroup}
      />
    </div>
  );
}
