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
import InfoIcon from '../../ui/InfoIcon';

type Props = {
  action: EditableAction;
  allEntries: readonly InterviewScreenEntry.WithScreenT[];
  defaultLanguage: string;
  onConditionalOperationChange: (action: EditableAction) => void;
};

function getOperatorDropdownOptions(
  type: 'generic' | 'date' | 'number',
): Array<DropdownOption<ConditionalAction.ConditionalOperator>> {
  let filterFunction;
  if (type === 'date') {
    filterFunction = ConditionalAction.isDateOperator;
  } else if (type === 'number') {
    filterFunction = ConditionalAction.isNumberOperator;
  } else {
    filterFunction = ConditionalAction.isGenericOperator;
  }
  return ConditionalAction.CONDITIONAL_OPERATORS.filter(filterFunction).map(
    operator => ({
      displayValue: ConditionalAction.operatorToDisplayString(operator),
      value: operator,
    }),
  );
}

const OPERATOR_OPTIONS = [
  {
    label: 'Generic comparisons',
    options: getOperatorDropdownOptions('generic'),
  },
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
  defaultLanguage,
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
        displayValue: `${InterviewScreen.getTitle(
          entry.screen,
          defaultLanguage,
        )} - ${entry.name}`,
        value: entry.responseKey,
      })),
    [allEntries, defaultLanguage],
  );

  // TODO: have to connect <ActionCard> to `entry` for responseKeyColumns to
  // change before 'Save' is clicked
  const allResponseKeyFieldOptions = React.useMemo(() => {
    // if the selected entry is an Airtable response, then we need to get the
    // table it links to so that we can get all the available fields
    const airtableTable = allAirtableTables.find(
      table =>
        selectedEntry?.responseType ===
          InterviewScreenEntry.ResponseType.AIRTABLE &&
        table.key === selectedEntry.responseTypeOptions.selectedTable,
    );

    return airtableTable?.fields.map(field => ({
      displayValue: field.fieldName,
      value: field.fieldName,
    }));
  }, [selectedEntry, allAirtableTables]);

  const onOperatorChange = React.useCallback(
    (newOperator: ConditionalAction.ConditionalOperator) => {
      // Set value to anything if operator is generic
      const newValue = ConditionalAction.isGenericOperator(newOperator)
        ? 'whatever'
        : null;
      if (newValue) {
        onConditionalOperationChange({
          ...action,
          conditionalOperator: newOperator,
          value: newValue,
        });
      } else {
        onConditionalOperationChange({
          ...action,
          conditionalOperator: newOperator,
        });
      }
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
          labelTextClassName="w-20"
          inlineContainerStyles={{ position: 'relative', top: 1 }}
        >
          <Dropdown
            onChange={onResponseKeyChange}
            placeholder="Select a response"
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
        {(ConditionalAction.isDateOperator(action.conditionalOperator) && (
          <>
            <Calendar
              placeholder="Date"
              inputClassName="py-1.5 border border-gray-400"
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
            <InfoIcon
              tooltip={`An empty date field in the source data will be treated as ${
                process.env.NULL_DATE_OVERRIDE || '1970-01-01'
              }`}
            />
          </>
        )) ||
          (ConditionalAction.isNumberOperator(action.conditionalOperator) && (
            <InputText
              placeholder="Value"
              onChange={onConditionalValueChange}
              value={action.value ?? ''}
            />
          ))}
      </div>
    </div>
  );
}
