import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { ChangeEvent, useCallback, useState } from 'react';
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
export default function ActionCard({ action }: Props): JSX.Element {
  const [isAlwaysExecuteChecked, setIsAlwaysExecuteChecked] = useState(true);

  // the response key to use for the conditional check
  const [responseKey, setResponseKey] = useState(action.responseKey);
  const [conditionalOperator, setConditionalOperator] = useState(
    action.conditionalOperator,
  );

  // the value to use for the conditional comparison
  const [conditionalValue, setConditionalValue] = useState(action.value);
  const [actionType, setActionType] = useState(action.actionConfig.type);

  const onAlwaysExecuteChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const isChecked = event.target.checked;
      setIsAlwaysExecuteChecked(isChecked);

      // if it is now unchecked and the conditionalOperator is ALWAYS_EXECUTE,
      // then we should change it to a reasonable default (such as EQUALS)
      if (
        !isChecked &&
        conditionalOperator ===
          ConditionalAction.ConditionalOperator.AlwaysExecute
      ) {
        setConditionalOperator(ConditionalAction.ConditionalOperator.Equals);
      }
    },
    [conditionalOperator],
  );

  // TODO: when the entries UI has been done, we should be loading the
  const conditionalOperatorRow = isAlwaysExecuteChecked ? null : (
    <div className="flex items-center space-x-4">
      <p style={labelStyle}>Condition</p>
      <Dropdown
        onChange={setResponseKey}
        defaultButtonLabel="Response variable"
        value={responseKey}
        options={[
          { displayValue: 'Response Key 1', value: 'responseKey1' },
          { displayValue: 'Response Key 2', value: 'responseKey2' },
        ]}
      />

      <Dropdown
        onChange={setConditionalOperator}
        defaultButtonLabel="Operator"
        value={conditionalOperator}
        options={OPERATOR_OPTIONS}
      />

      <InputText
        placeholder="value"
        onChange={setConditionalValue}
        value={conditionalValue ?? ''}
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
            onChange={setActionType}
            defaultButtonLabel="Action type"
            value={actionType}
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
