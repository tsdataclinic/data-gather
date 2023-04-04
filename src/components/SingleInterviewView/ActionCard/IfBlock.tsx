import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import ConditionGroupBlock from './ConditionGroupBlock';
import ActionConfigEditor from './ActionConfigEditor';
import type { EditableEntryWithScreen } from '../types';
import AddConditionButtons from './AddConditionButtons';

type Props = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  ifClause: ConditionalAction.IfClause;
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onIfClauseChange: (newIfClause: ConditionalAction.IfClause) => void;
};

export default function IfBlock({
  allInterviewEntries,
  ifClause,
  interview,
  interviewScreen,
  onIfClauseChange,
}: Props): JSX.Element {
  const { action, conditionGroup, elseClause } = ifClause;

  const onConditionGroupChange = React.useCallback(
    (newConditionGroup: ConditionalAction.ConditionGroup): void => {
      console.log('on condition group change', newConditionGroup);
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

  return (
    <div className="space-y-2">
      <h3>If...</h3>
      <ConditionGroupBlock
        allInterviewEntries={allInterviewEntries}
        conditionGroup={conditionGroup}
        defaultLanguage={interview.defaultLanguage}
        onConditionGroupChange={onConditionGroupChange}
      />
      <h3>Then do the following action</h3>
      {/* TODO: we need to correctly detect if ALWAYS_EXECUTE is selected
      in the top-level if-clause */}
      <ActionConfigEditor
        actionConfig={action}
        onActionConfigChange={onActionConfigChange}
        interview={interview}
        interviewScreen={interviewScreen}
        isAlwaysExecuteChecked={false}
      />
      <h3>Otherwise, do the following...</h3>
      {ConditionalAction.isIfClause(elseClause) ? (
        <div className="ml-3 rounded border border-dashed border-gray-400 p-3">
          <IfBlock
            allInterviewEntries={allInterviewEntries}
            interview={interview}
            interviewScreen={interviewScreen}
            ifClause={elseClause}
            onIfClauseChange={onElseClauseChange}
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
    </div>
  );
}
