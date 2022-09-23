import * as React from 'react';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../models/ConditionalAction';
import Dropdown from '../ui/Dropdown';
import InputText from '../ui/InputText';
import LabelWrapper from '../ui/LabelWrapper';

// remove 'ALWAYS_EXECUTE' from being one of the options in the dropdown
// because this operator is handled separately
const OPERATOR_OPTIONS = ConditionalAction.CONDITIONAL_OPERATORS.filter(
  operator => operator !== ConditionalAction.ConditionalOperator.AlwaysExecute,
).map(operator => ({
  displayValue: ConditionalAction.operatorToDisplayString(operator),
  value: operator,
}));

const ACTION_TYPE_OPTIONS = ConditionalAction.ACTION_TYPES.map(actionType => ({
  displayValue: ConditionalAction.actionTypeToDisplayString(actionType),
  value: actionType,
}));

const labelStyle = { width: '5rem' };

type Props = {
  action: ConditionalAction.T;
  onActionChange: (action: ConditionalAction.T) => void;
};

// TODO: currently any edits to an action remain local to this component.
// Next steps are to make this persistable to backend.
export default function ActionCard({
  action,
  onActionChange,
}: Props): JSX.Element {
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

  const onActionTypeChange = React.useCallback(
    (newActionType: ConditionalAction.ActionType) => {
      onActionChange({
        ...action,
        actionConfig:
          ConditionalAction.createDefaultActionConfig(newActionType),
      });
    },
    [action, onActionChange],
  );

  const conditionalOperatorRow = isAlwaysExecuteChecked ? null : (
    <div className="flex items-center space-x-4">
      <p style={labelStyle}>Condition</p>
      <Dropdown
        onChange={onResponseKeyChange}
        defaultButtonLabel="Response variable"
        value={action.responseKey}
        options={[
          { displayValue: 'Response Key 1', value: 'responseKey1' },
          { displayValue: 'Response Key 2', value: 'responseKey2' },
        ]}
      />

      <Dropdown
        onChange={onConditionalOperatorChange}
        defaultButtonLabel="Operator"
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
      className="grid h-60 w-full grid-cols-4 bg-white p-8 shadow-md"
    >
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        <span>Action</span>
      </div>
      <div className="col-span-3 space-y-4">
        <p>
          <em>
            This implementation is incomplete. It does not persist to storage
            yet.
          </em>
        </p>
        <LabelWrapper labelAfter label="Always execute this action">
          <MixedCheckbox
            checked={isAlwaysExecuteChecked}
            onChange={onAlwaysExecuteChange}
          />
        </LabelWrapper>

        {conditionalOperatorRow}

        <LabelWrapper inline label="Action" labelTextStyle={labelStyle}>
          <Dropdown
            onChange={onActionTypeChange}
            defaultButtonLabel="Action type"
            value={action.actionConfig.type}
            options={ACTION_TYPE_OPTIONS}
          />
        </LabelWrapper>

        <LabelWrapper inline label="Payload" labelTextStyle={labelStyle}>
          <Dropdown
            onChange={() => alert('Not implemented yet')}
            defaultButtonLabel="No payload selected"
            value={undefined}
            options={[]}
          />
        </LabelWrapper>
      </div>
    </ScrollableElement>
  );
}
