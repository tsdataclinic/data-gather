import * as React from 'react';
import { Calendar } from 'primereact/calendar';
import Dropdown from '../../ui/Dropdown';
import InputText from '../../ui/InputText';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import type { EditableAction } from '../types';
import useAppState from '../../../hooks/useAppState';

type Props = {
  action: EditableAction;
  allEntries: readonly InterviewScreenEntry.WithScreenT[];
  onConditionalOperationChange: (action: EditableAction) => void;
};

// remove 'ALWAYS_EXECUTE' from being one of the options in the dropdown
// because this operator is handled separately
const OPERATOR_OPTIONS = ConditionalAction.CONDITIONAL_OPERATORS.filter(
  operator => operator !== ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
).map(operator => ({
  displayValue: ConditionalAction.operatorToDisplayString(operator),
  value: operator,
}));

// The conditionalOperatorRow doesn't use Form.Input or other Form
// subcomponents because we need more control over how it renders
export default function ConditionalOperatorRow({
  action,
  allEntries,
  onConditionalOperationChange,
}: Props): JSX.Element {
  const { airtableSettings } = useAppState();
  const { bases } = airtableSettings;
  const allAirtableTables = React.useMemo(
    () => bases.flatMap(base => base.tables),
    [bases],
  );

  const selectedEntry = React.useMemo(
    () => allEntries.find(entry => entry.responseKey === action.responseKey),
    [allEntries, action],
  );

  // TODO: this is only looking at entries. We also need to look at Skip actions.
  const allResponseKeyOptions = React.useMemo(
    () =>
      allEntries.map(entry => ({
        displayValue: `${entry.screen.title} - ${entry.name}`,
        value: entry.responseKey,
      })),
    [allEntries],
  );

  // TODO: have to connect <ActionCard> to `entry` for responseKeyColumns to
  // change before 'Save' is clicked
  const allResponseKeyFieldOptions = React.useMemo(() => {
    const airtableTable = allAirtableTables.find(
      table => table.key === selectedEntry?.responseTypeOptions.selectedTable,
    );

    return airtableTable?.fields.map(field => ({
      displayValue: field.fieldName,
      value: field.fieldName,
    }));
  }, [selectedEntry, allAirtableTables]);

  const onOperatorChange = React.useCallback(
    (newOperator: ConditionalAction.ConditionalOperator) => {
      onConditionalOperationChange({
        ...action,
        conditionalOperator: newOperator,
      });
    },
    [action, onConditionalOperationChange],
  );

  const onResponseKeyChange = React.useCallback(
    (newResponseKey: string) => {
      onConditionalOperationChange({
        ...action,
        responseKey: newResponseKey,
      });
    },
    [action, onConditionalOperationChange],
  );

  const onResponseKeyFieldChange = React.useCallback(
    (newResponseKeyField: string) => {
      onConditionalOperationChange({
        ...action,
        responseKeyField: newResponseKeyField,
      });
    },
    [action, onConditionalOperationChange],
  );

  const onConditionalValueChange = React.useCallback(
    (newValue: string) => {
      onConditionalOperationChange({
        ...action,
        value: newValue,
      });
    },
    [action, onConditionalOperationChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <p className="w-20">Condition</p>
        <Dropdown
          onChange={onResponseKeyChange}
          placeholder="Response variable"
          value={action.responseKey}
          options={allResponseKeyOptions}
        />
        {/* TODO - connect up to `entry` state object and condition on ResponseType.AIRTABLE instead of this approach */}
        {allResponseKeyFieldOptions && allResponseKeyFieldOptions.length > 0 ? (
          <Dropdown
            onChange={onResponseKeyFieldChange}
            placeholder="Column name"
            value={action.responseKeyField}
            options={allResponseKeyFieldOptions}
          />
        ) : null}

        <Dropdown
          onChange={onOperatorChange}
          placeholder="Operator"
          value={action.conditionalOperator}
          options={OPERATOR_OPTIONS}
        />

        {/* TODO - connect up to `entry` state object and condition on ResponseType.AIRTABLE instead of this approach */}
        {ConditionalAction.isTimeOperator(action.conditionalOperator) ? (
          <Calendar
            placeholder="Date"
            onChange={e => {
              if (e.value instanceof Date) {
                onConditionalValueChange(e.value.toISOString());
              }
              if (typeof e.value === 'string') {
                onConditionalValueChange(e.value);
              }
            }}
            value={action.value ? new Date(action.value) : ''}
          />
        ) : (
          <InputText
            placeholder="Value"
            onChange={onConditionalValueChange}
            value={action.value ?? ''}
          />
        )}
      </div>
    </div>
  );
}
