import { AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import classNames from 'classnames';
import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as ConditionalAction from '../../../models/ConditionalAction';
import type { EditableEntryWithScreen } from '../types';
import AddConditionButtons from './AddConditionButtons';
import Dropdown from '../../ui/Dropdown';
import SingleConditionRow from './SingleConditionRow';

type ConditionOrGroup =
  | ConditionalAction.SingleCondition
  | ConditionalAction.ConditionGroup;

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

  /** Called when the drag handle is clicked */
  onDragHandleClick?: (event: React.PointerEvent) => void;
  showDragHandle?: boolean;
};

export default function ConditionGroupBlock({
  allInterviewEntries,
  conditionGroup,
  defaultLanguage,
  onConditionGroupChange,
  onConditionGroupDelete,
  onDragHandleClick,
  hideDeleteGroupButton = false,
  showDragHandle = false,
}: Props): JSX.Element {
  const { type: conditionGroupType, conditions } = conditionGroup;

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
    (newCondition: ConditionOrGroup): void => {
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
    (conditionToDelete: ConditionOrGroup) => {
      onConditionGroupChange({
        ...conditionGroup,
        conditions: conditionGroup.conditions.filter(
          condition => condition.id !== conditionToDelete.id,
        ),
      });
    },
    [conditionGroup, onConditionGroupChange],
  );

  const onNestedConditionsReorder = React.useCallback(
    (newConditions: readonly ConditionOrGroup[]) => {
      onConditionGroupChange({
        ...conditionGroup,
        conditions: newConditions,
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

  const conditionElts = React.useMemo(
    () =>
      conditions.map((condition, idx) => (
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <DraggableConditionRow
          key={condition.id}
          allInterviewEntries={allInterviewEntries}
          defaultLanguage={defaultLanguage}
          condition={condition}
          conditionGroupType={conditionGroupType}
          isOnlyCondition={conditions.length === 1}
          isGroupTypeDisplayed={idx === 0}
          isGroupTypeEditable={idx === 1}
          onNestedConditionChange={onNestedConditionChange}
          onNestedConditionDelete={onNestedConditionDelete}
          onConditionGroupTypeChange={onConditionGroupTypeChange}
        />
      )),
    [
      conditionGroupType,
      allInterviewEntries,
      defaultLanguage,
      conditions,
      onNestedConditionDelete,
      onNestedConditionChange,
      onConditionGroupTypeChange,
    ],
  );

  const groupDescriptor =
    conditions.length > 1 ? (
      <p>
        {conditionGroupType === 'and'
          ? 'All of the following are true'
          : 'Any of the following are true'}
      </p>
    ) : null;

  return (
    <div className="relative space-y-2 rounded border border-gray-300 bg-gray-100 p-3">
      {showDragHandle ? (
        <FontAwesomeIcon
          size="1x"
          className="absolute top-1 right-0 cursor-grab pr-2.5 text-slate-400 transition-transform hover:scale-110 hover:text-slate-600"
          icon={IconType.faGripVertical}
          onPointerDown={onDragHandleClick}
        />
      ) : null}
      {conditions.length === 0 ? (
        <em>No conditions have been added.</em>
      ) : (
        <div className="space-y-2">
          {groupDescriptor}
          <Reorder.Group
            axis="y"
            className="space-y-2"
            values={conditions as ConditionOrGroup[]}
            onReorder={onNestedConditionsReorder}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {conditionElts}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
      <AddConditionButtons
        hideRemoveConditionGroupButton={hideDeleteGroupButton}
        onAddCondition={onAddSingleCondition}
        onAddConditionGroup={onAddConditionGroup}
        onDeleteConditionGroup={onDeleteThisConditionGroup}
      />
    </div>
  );
}

const CONDITIONAL_GROUP_TYPE_OPTIONS = [
  { value: 'and' as const, displayValue: 'And' },
  { value: 'or' as const, displayValue: 'Or' },
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

type DraggableConditionRowProps = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  condition: ConditionOrGroup;
  conditionGroupType: ConditionalAction.ConditionGroupType;
  defaultLanguage: string;
  isGroupTypeDisplayed: boolean;
  isGroupTypeEditable: boolean;
  isOnlyCondition: boolean;
  onConditionGroupTypeChange: (
    newGroupType: ConditionalAction.ConditionGroupType,
  ) => void;
  onNestedConditionChange: (newCondition: ConditionOrGroup) => void;
  onNestedConditionDelete: (conditionToDelete: ConditionOrGroup) => void;
};

/**
 * A draggable SingleConditionRow or a ConditionGroup. We don't put this
 * in its own file because it needs to recursively refer to ConditionGroup
 * and we need to avoid a circular dependency.
 */
function DraggableConditionRow({
  allInterviewEntries,
  condition,
  conditionGroupType,
  defaultLanguage,
  isGroupTypeDisplayed,
  isGroupTypeEditable,
  isOnlyCondition,
  onNestedConditionChange,
  onNestedConditionDelete,
  onConditionGroupTypeChange,
}: DraggableConditionRowProps): JSX.Element {
  const dragControls = useDragControls();
  const onDragStart = React.useCallback(
    (e: React.PointerEvent) => dragControls.start(e),
    [dragControls],
  );

  const isSingleCondition = ConditionalAction.isSingleCondition(condition);
  const groupTypeClassName = classNames('w-20', {
    'pt-4': !isSingleCondition,
  });

  const containerClassName = classNames('flex space-x-2', {
    'items-center': isSingleCondition,
    'items-start': !isSingleCondition,
  });

  const groupTypeColumn =
    // only display the group type if we have more than 1 condition
    isOnlyCondition ? null : (
      <div className={groupTypeClassName}>
        {/* the 1st item is an empty div just for spacing */}
        {isGroupTypeDisplayed ? null : (
          <ConditionalGroupTypeDisplay
            isEditable={isGroupTypeEditable}
            conditionGroupType={conditionGroupType}
            onConditionGroupTypeChange={onConditionGroupTypeChange}
          />
        )}
      </div>
    );

  return (
    <Reorder.Item
      key={condition.id}
      className={containerClassName}
      value={condition}
      dragControls={dragControls}
      dragListener={false}
    >
      {groupTypeColumn}
      {isSingleCondition ? (
        <SingleConditionRow
          condition={condition}
          allInterviewEntries={allInterviewEntries}
          defaultLanguage={defaultLanguage}
          onConditionChange={onNestedConditionChange}
          onConditionDelete={onNestedConditionDelete}
          onDragHandleClick={onDragStart}
        />
      ) : (
        <ConditionGroupBlock
          showDragHandle
          allInterviewEntries={allInterviewEntries}
          conditionGroup={condition}
          defaultLanguage={defaultLanguage}
          onConditionGroupChange={onNestedConditionChange}
          onConditionGroupDelete={onNestedConditionDelete}
          onDragHandleClick={onDragStart}
        />
      )}
    </Reorder.Item>
  );
}
