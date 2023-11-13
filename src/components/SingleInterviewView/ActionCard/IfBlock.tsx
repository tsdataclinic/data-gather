import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import ConditionGroupBlock from './ConditionGroupBlock';
import ActionConfigEditor from './ActionConfigEditor';
import type { EditableEntryWithScreen } from '../types';
import AddConditionButtons from './AddConditionButtons';
import LabelWrapper from '../../ui/LabelWrapper';
import Button from '../../ui/Button';

type Props = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  hideAlwaysExecuteOption?: boolean;
  ifClause: ConditionalAction.IfClause;
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onDeleteIfClause?: () => void;
  onIfClauseChange: (newIfClause: ConditionalAction.IfClause) => void;
  showDeleteIfClauseButton?: boolean;
};

export default function IfBlock({
  allInterviewEntries,
  ifClause,
  interview,
  interviewScreen,
  onIfClauseChange,
  onDeleteIfClause,
  showDeleteIfClauseButton = false,
  hideAlwaysExecuteOption = false,
}: Props): JSX.Element {
  const { action, conditionGroup, elseClause } = ifClause;

  const firstCondition = conditionGroup.conditions[0];

  // 'ALWAYS_EXECUTE' is technically a condition, but it can only be set as the first
  // condition, which is why we only check that one.
  const isAlwaysExecuteChecked =
    firstCondition &&
    ConditionalAction.isSingleCondition(firstCondition) &&
    firstCondition.conditionalOperator === 'always_execute';

  const onConditionGroupChange = React.useCallback(
    (newConditionGroup: ConditionalAction.ConditionGroup): void => {
      onIfClauseChange({
        ...ifClause,
        conditionGroup: newConditionGroup,
      });
    },
    [ifClause, onIfClauseChange],
  );

  const onActionConfigChange = React.useCallback(
    (newActionConfig: ConditionalAction.ActionConfig): void => {
      onIfClauseChange({
        ...ifClause,
        action: newActionConfig,
      });
    },
    [ifClause, onIfClauseChange],
  );

  const onElseActionChange = React.useCallback(
    (newActionConfig: ConditionalAction.ActionConfig): void => {
      onIfClauseChange({
        ...ifClause,
        elseClause: newActionConfig,
      });
    },
    [ifClause, onIfClauseChange],
  );

  const onElseClauseChange = React.useCallback(
    (newElseClause: ConditionalAction.IfClause): void => {
      onIfClauseChange({
        ...ifClause,
        elseClause: newElseClause,
      });
    },
    [ifClause, onIfClauseChange],
  );

  const onCreateElseCondition = React.useCallback(() => {
    onIfClauseChange({
      ...ifClause,
      elseClause: ConditionalAction.createDefaultIfClause(),
    });
  }, [onIfClauseChange, ifClause]);

  // if an else clause is deleted we default it back to be a DO_NOTHING action
  const onDeleteElseCondition = React.useCallback(() => {
    onIfClauseChange({
      ...ifClause,
      elseClause: ConditionalAction.createDefaultActionConfig('do_nothing'),
    });
  }, [onIfClauseChange, ifClause]);

  const onAlwaysExecuteChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      onIfClauseChange({
        ...ifClause,
        conditionGroup: {
          ...conditionGroup,
          // only update the first condition
          conditions: [
            {
              id: firstCondition.id,
              conditionalOperator: isChecked ? 'always_execute' : 'eq',
            },
          ],
        },
        elseClause: isChecked
          ? ConditionalAction.createDefaultActionConfig('do_nothing')
          : ConditionalAction.createDefaultActionConfig('push'),
      });
    },
    [onIfClauseChange, ifClause, conditionGroup, firstCondition],
  );

  return (
    <div className="space-y-2">
      <div className="relative flex justify-between">
        {showDeleteIfClauseButton ? (
          <Button
            unstyled
            className="absolute right-0 top-[-0.33rem]"
            onClick={onDeleteIfClause}
          >
            <FontAwesomeIcon
              aria-label="Delete"
              className="h-4 w-4 text-slate-400 transition-colors duration-200 hover:text-red-500"
              icon={IconType.faX}
            />
          </Button>
        ) : null}

        <h3>If...</h3>

        {/* TODO: create a Form.Checkbox control */}
        {hideAlwaysExecuteOption ? null : (
          <LabelWrapper inline labelAfter label="Always execute this action">
            <input
              type="checkbox"
              checked={isAlwaysExecuteChecked}
              onChange={onAlwaysExecuteChange}
            />
          </LabelWrapper>
        )}
      </div>
      {isAlwaysExecuteChecked ? null : (
        <ConditionGroupBlock
          hideDeleteGroupButton
          allInterviewEntries={allInterviewEntries}
          conditionGroup={conditionGroup}
          defaultLanguage={interview.defaultLanguage}
          onConditionGroupChange={onConditionGroupChange}
        />
      )}
      <h3>Then do the following action</h3>
      <ActionConfigEditor
        actionConfig={action}
        onActionConfigChange={onActionConfigChange}
        interview={interview}
        interviewScreen={interviewScreen}
        isAlwaysExecuteChecked={false}
      />
      {isAlwaysExecuteChecked ? null : (
        <>
          <h3>Otherwise, do the following...</h3>
          {ConditionalAction.isIfClause(elseClause) ? (
            <div className="ml-3 rounded border border-dashed border-gray-400 p-3">
              <IfBlock
                showDeleteIfClauseButton
                hideAlwaysExecuteOption
                allInterviewEntries={allInterviewEntries}
                interview={interview}
                interviewScreen={interviewScreen}
                ifClause={elseClause}
                onIfClauseChange={onElseClauseChange}
                onDeleteIfClause={onDeleteElseCondition}
              />
            </div>
          ) : (
            <>
              <AddConditionButtons
                hideConditionGroupButton
                onAddCondition={onCreateElseCondition}
              />
              <ActionConfigEditor
                actionConfig={elseClause}
                onActionConfigChange={onElseActionChange}
                interview={interview}
                interviewScreen={interviewScreen}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
