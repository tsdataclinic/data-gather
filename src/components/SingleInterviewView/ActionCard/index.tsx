import * as React from 'react';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import Dropdown from '../../ui/Dropdown';
import InputText from '../../ui/InputText';
import LabelWrapper from '../../ui/LabelWrapper';
import ActionConfigEditor from './ActionConfigEditor';
import Form from '../../ui/Form';
import useInterviewScreenEntries from '../../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../../hooks/useInterviewScreens';

// remove 'ALWAYS_EXECUTE' from being one of the options in the dropdown
// because this operator is handled separately
const OPERATOR_OPTIONS = ConditionalAction.CONDITIONAL_OPERATORS.filter(
  operator => operator !== ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
).map(operator => ({
  displayValue: ConditionalAction.operatorToDisplayString(operator),
  value: operator,
}));

type Props = {
  action: ConditionalAction.T | ConditionalAction.CreateT;
  interview: Interview.T;
  onActionChange: (
    action: ConditionalAction.T | ConditionalAction.CreateT,
  ) => void;
};

function ActionCard(
  { action, onActionChange, interview }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  // TODO: when interview is a nested model we won't need these sub-queries
  const interviewScreens = useInterviewScreens(interview.id);
  const screenEntriesMap = useInterviewScreenEntries(interview.id);

  const [isAlwaysExecuteChecked, setIsAlwaysExecuteChecked] = React.useState(
    action.conditionalOperator ===
      ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
  );

  const onAlwaysExecuteChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const isChecked = event.target.checked;
      setIsAlwaysExecuteChecked(isChecked);

      // if it is now unchecked and the conditionalOperator is ALWAYS_EXECUTE,
      // then we should change it to a reasonable default (such as EQUALS)
      if (
        !isChecked &&
        action.conditionalOperator ===
          ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE
      ) {
        onActionChange({
          ...action,
          conditionalOperator: ConditionalAction.ConditionalOperator.EQ,
        });
      }
    },
    [action, onActionChange],
  );

  const onConditionalOperatorChange = React.useCallback(
    (newConditionalOperator: ConditionalAction.ConditionalOperator) => {
      onActionChange({
        ...action,
        conditionalOperator: newConditionalOperator,
      });
    },
    [action, onActionChange],
  );

  const onResponseKeyChange = React.useCallback(
    (newResponseKey: string) => {
      onActionChange({
        ...action,
        responseKey: newResponseKey,
      });
    },
    [action, onActionChange],
  );

  const onConditionalValueChange = React.useCallback(
    (newValue: string) => {
      onActionChange({
        ...action,
        value: newValue,
      });
    },
    [action, onActionChange],
  );

  const onActionConfigChange = React.useCallback(
    (newActionConfig: ConditionalAction.T['actionConfig']) => {
      onActionChange({
        ...action,
        actionConfig: newActionConfig,
      });
    },
    [action, onActionChange],
  );

  // TODO: this is only looking at entries. We also need to look at Skip actions.
  const allResponseKeyOptions =
    interviewScreens && screenEntriesMap
      ? interviewScreens.flatMap(screen => {
          const entries = screenEntriesMap.get(screen.id) || [];
          return entries.map(entry => ({
            displayValue: `${screen.title} - ${entry.name}`,
            value: entry.responseId,
          }));
        })
      : [];

  // The conditionalOperatorRow doesn't use Form.Input or other Form
  // subcomponents because we need more control over how it renders
  const conditionalOperatorRow = isAlwaysExecuteChecked ? null : (
    <div className="flex items-center space-x-4">
      <p className="w-20">Condition</p>
      <Dropdown
        onChange={onResponseKeyChange}
        placeholder="Response variable"
        value={action.responseKey}
        options={allResponseKeyOptions}
      />

      <Dropdown
        onChange={onConditionalOperatorChange}
        placeholder="Operator"
        value={action.conditionalOperator}
        options={OPERATOR_OPTIONS}
      />

      <InputText
        placeholder="value"
        onChange={onConditionalValueChange}
        value={action.value ?? ''}
      />
    </div>
  );

  return (
    <ScrollableElement
      name="ACTION"
      className="grid w-full grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg"
    >
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        <span>Action</span>
      </div>

      {
        // TODO: create a Form.Checkbox control
      }
      <Form ref={forwardedRef} className="col-span-3 space-y-4">
        <LabelWrapper inline labelAfter label="Always execute this action">
          <MixedCheckbox
            checked={isAlwaysExecuteChecked}
            onChange={onAlwaysExecuteChange}
          />
        </LabelWrapper>
        {conditionalOperatorRow}
        <ActionConfigEditor
          action={action}
          onActionConfigChange={onActionConfigChange}
          interview={interview}
        />
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(ActionCard);
