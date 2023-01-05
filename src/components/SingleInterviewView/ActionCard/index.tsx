import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { Element as ScrollableElement } from 'react-scroll';
import { Calendar } from 'primereact/calendar';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import Dropdown from '../../ui/Dropdown';
import InputText from '../../ui/InputText';
import LabelWrapper from '../../ui/LabelWrapper';
import ActionConfigEditor from './ActionConfigEditor';
import Form from '../../ui/Form';
import useInterviewScreenEntries from '../../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../../hooks/useInterviewScreens';

export type EditableAction = ConditionalAction.T | ConditionalAction.CreateT;

// remove 'ALWAYS_EXECUTE' from being one of the options in the dropdown
// because this operator is handled separately
const OPERATOR_OPTIONS = ConditionalAction.CONDITIONAL_OPERATORS.filter(
  operator => operator !== ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
).map(operator => ({
  displayValue: ConditionalAction.operatorToDisplayString(operator),
  value: operator,
}));

type Props = {
  action: EditableAction;
  interview: Interview.T;
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onActionDelete: (actionToDelete: EditableAction) => void;
};

// The conditionalOperatorRow doesn't use Form.Input or other Form
// subcomponents because we need more control over how it renders
function ConditionalOperatorRow({
  action,
  onResponseKeyChange,
  allResponseKeyOptions,
  onResponseKeyColumnChange,
  allResponseKeyColumnOptions,
  onConditionalOperatorChange,
  onConditionalValueChange,
  conditionalValueType,
}: any): JSX.Element {
  return (
    <div className="flex items-center space-x-4">
      <p className="w-20">Condition</p>
      <Dropdown
        onChange={onResponseKeyChange}
        placeholder="Response variable"
        value={action.responseKey}
        options={allResponseKeyOptions}
      />
      {/* TODO - connect up to `entry` state object and condition on ResponseType.AIRTABLE instead of this approach */}
      {allResponseKeyColumnOptions.length > 0 && (
        <Dropdown
          onChange={onResponseKeyColumnChange}
          placeholder="Response column variable"
          value={action.responseKeyColumn}
          options={allResponseKeyColumnOptions}
        />
      )}

      <Dropdown
        onChange={onConditionalOperatorChange}
        placeholder="Operator"
        value={action.conditionalOperator}
        options={OPERATOR_OPTIONS}
      />

      {/* TODO - connect up to `entry` state object and condition on ResponseType.AIRTABLE instead of this approach */}
      {conditionalValueType === 'date' ? (
        <Calendar
          placeholder="value"
          onChange={e => onConditionalValueChange(e.value)}
          value={action.value ?? ''}
        />
      ) : (
        <InputText
          placeholder="value"
          onChange={onConditionalValueChange}
          value={action.value ?? ''}
        />
      )}
    </div>
  );
}

function ActionCard(
  { action, interview, onActionChange, onActionDelete }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  // TODO: when interview is a nested model we won't need these sub-queries
  const actionId = 'id' in action ? action.id : action.tempId;
  const interviewScreens = useInterviewScreens(interview.id);
  const screenEntriesMap = useInterviewScreenEntries(interview.id);

  const [isAlwaysExecuteChecked, setIsAlwaysExecuteChecked] = React.useState(
    action.conditionalOperator ===
      ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
  );

  const [conditionalValueType, setConditionalValueType] = React.useState<
    'text' | 'date'
  >(action.value && Date.parse(action.value) ? 'date' : 'text');

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
        onActionChange(action, {
          ...action,
          conditionalOperator: ConditionalAction.ConditionalOperator.EQ,
        });
      }
    },
    [action, onActionChange],
  );

  const onConditionalOperatorChange = React.useCallback(
    (newConditionalOperator: ConditionalAction.ConditionalOperator) => {
      onActionChange(action, {
        ...action,
        conditionalOperator: newConditionalOperator,
      });
    },
    [action, onActionChange],
  );

  const onResponseKeyChange = React.useCallback(
    (newResponseKey: string) => {
      onActionChange(action, {
        ...action,
        responseKey: newResponseKey,
      });
    },
    [action, onActionChange],
  );

  const onResponseKeyColumnChange = React.useCallback(
    (newResponseKeyColumn: string) => {
      onActionChange(action, {
        ...action,
        responseKeyColumn: newResponseKeyColumn,
      });
    },
    [action, onActionChange],
  );

  const onConditionalValueChange = React.useCallback(
    (newValue: string) => {
      onActionChange(action, {
        ...action,
        value: newValue,
      });
    },
    [action, onActionChange],
  );

  const onActionConfigChange = React.useCallback(
    (newActionConfig: ConditionalAction.T['actionConfig']) => {
      onActionChange(action, {
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
            value: entry.responseKey,
          }));
        })
      : [];

  // TODO: have to connect <ActionCard> to `entry` for responseKeyColumns to change before 'Save' is clicked
  const allResponseKeyColumnOptions =
    interviewScreens && screenEntriesMap
      ? interviewScreens.flatMap(screen => {
          const entries = screenEntriesMap.get(screen.id) || [];
          return entries
            .filter(entry => entry.responseType === 'airtable')
            .flatMap(entry =>
              entry.responseTypeOptions.selectedFields.map(field => ({
                displayValue: `${entry.responseTypeOptions.selectedBase} - ${field}`,
                value: field,
              })),
            );
        })
      : [];

  return (
    <ScrollableElement
      name={actionId}
      className="relative grid w-full grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg"
    >
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        <span>Action</span>
      </div>
      <div className="absolute top-0 right-0 pr-4 pt-4">
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 cursor-pointer text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
          onClick={() => onActionDelete(action)}
        />
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
        <LabelWrapper inline labelAfter label="Compare against a date">
          <MixedCheckbox
            onChange={e =>
              setConditionalValueType(e.target.checked ? 'date' : 'text')
            }
            checked={conditionalValueType === 'date'}
          />
        </LabelWrapper>
        {!isAlwaysExecuteChecked && (
          <ConditionalOperatorRow
            action={action}
            onResponseKeyChange={onResponseKeyChange}
            allResponseKeyOptions={allResponseKeyOptions}
            onResponseKeyColumnChange={onResponseKeyColumnChange}
            allResponseKeyColumnOptions={allResponseKeyColumnOptions}
            onConditionalOperatorChange={onConditionalOperatorChange}
            onConditionalValueChange={onConditionalValueChange}
            conditionalValueType={conditionalValueType}
          />
        )}
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
