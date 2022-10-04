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

// remove 'ALWAYS_EXECUTE' from being one of the options in the dropdown
// because this operator is handled separately
const OPERATOR_OPTIONS = ConditionalAction.CONDITIONAL_OPERATORS.filter(
  operator => operator !== ConditionalAction.ConditionalOperator.AlwaysExecute,
).map(operator => ({
  displayValue: ConditionalAction.operatorToDisplayString(operator),
  value: operator,
}));

type Props = {
  action: ConditionalAction.T;
  interview: Interview.T;
  onActionChange: (action: ConditionalAction.T) => void;
};

function ActionCard(
  { action, onActionChange, interview }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const [isAlwaysExecuteChecked, setIsAlwaysExecuteChecked] =
    React.useState(true);

  const onAlwaysExecuteChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const isChecked = event.target.checked;
      setIsAlwaysExecuteChecked(isChecked);

      // if it is now unchecked and the conditionalOperator is ALWAYS_EXECUTE,
      // then we should change it to a reasonable default (such as EQUALS)
      if (
        !isChecked &&
        action.conditionalOperator ===
          ConditionalAction.ConditionalOperator.AlwaysExecute
      ) {
        onActionChange({
          ...action,
          conditionalOperator: ConditionalAction.ConditionalOperator.Equals,
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

  // The conditionalOperatorRow doesn't use Form.Input or other Form
  // subcomponents because we need more control over how it renders
  const conditionalOperatorRow = isAlwaysExecuteChecked ? null : (
    <div className="flex items-center space-x-4">
      <p className="w-20">Condition</p>
      <Dropdown
        onChange={onResponseKeyChange}
        placeholder="Response variable"
        value={action.responseKey}
        options={[
          { displayValue: 'Response Key 1', value: 'responseKey1' },
          { displayValue: 'Response Key 2', value: 'responseKey2' },
        ]}
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
      key={action.id}
      name="ACTION"
      className="grid h-60 w-full grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg"
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
          actionConfig={action.actionConfig}
          onActionConfigChange={onActionConfigChange}
          interview={interview}
        />
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(ActionCard);
