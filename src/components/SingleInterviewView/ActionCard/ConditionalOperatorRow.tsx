import * as React from 'react';
import { Calendar } from 'primereact/calendar';
import Dropdown, { type DropdownOption } from '../../ui/Dropdown';
import InputText from '../../ui/InputText';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import * as InterviewScreen from '../../../models/InterviewScreen';
import type { EditableAction } from '../types';
import useAppState from '../../../hooks/useAppState';
import LabelWrapper from '../../ui/LabelWrapper';

type Props = {
  action: EditableAction;
  allEntries: readonly InterviewScreenEntry.WithScreenT[];
  onConditionalOperationChange: (action: EditableAction) => void;
};

function getOperatorDropdownOptions(
  type: 'date' | 'number',
): Array<DropdownOption<ConditionalAction.ConditionalOperator>> {
  const filterFunction =
    type === 'date'
      ? ConditionalAction.isDateOperator
      : ConditionalAction.isNumberOperator;
  return ConditionalAction.CONDITIONAL_OPERATORS.filter(filterFunction).map(
    operator => ({
      displayValue: ConditionalAction.operatorToDisplayString(operator),
      value: operator,
    }),
  );
}

const OPERATOR_OPTIONS = [
  {
    label: 'Date comparisons',
    options: getOperatorDropdownOptions('date'),
  },
  {
    label: 'Numeric comparisons',
    options: getOperatorDropdownOptions('number'),
  },
];

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
        displayValue: `${InterviewScreen.getTitle(entry.screen)} - ${
          entry.name
        }`,
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
        <LabelWrapper
          inline
          label="If..."
          infoTooltip={`An empty date field in the source data will be treated as ${
            process.env.NULL_DATE_OVERRIDE || '1970-01-01'
          }`}
          labelTextClassName="mr-1"
          inlineContainerStyles={{ position: 'relative', top: 1 }}
        >
          <Dropdown
            onChange={onResponseKeyChange}
            placeholder="Response variable"
            value={action.responseKey}
            options={allResponseKeyOptions}
          />
        </LabelWrapper>
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
        {ConditionalAction.isDateOperator(action.conditionalOperator) ? (
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
