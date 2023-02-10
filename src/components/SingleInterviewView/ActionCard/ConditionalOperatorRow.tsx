import * as React from 'react';
import { Calendar } from 'primereact/calendar';
import Dropdown, { type DropdownOption } from '../../ui/Dropdown';
import InputText from '../../ui/InputText';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import * as InterviewScreen from '../../../models/InterviewScreen';
import useAppState from '../../../hooks/useAppState';
import LabelWrapper from '../../ui/LabelWrapper';
import InfoIcon from '../../ui/InfoIcon';
import type { EditableAction, EditableEntryWithScreen } from '../types';

type Props = {
  action: EditableAction;
  allInterviewEntries: readonly EditableEntryWithScreen[];
  defaultLanguage: string;
  onConditionalOperationChange: (action: EditableAction) => void;
};

function getOperatorDropdownOptions(
  groupType: ConditionalAction.ConditionalOperatorGroupType,
): Array<DropdownOption<ConditionalAction.ConditionalOperator>> {
  return ConditionalAction.CONDITIONAL_OPERATORS.filter(op =>
    ConditionalAction.isOperatorOfGroupType(op, groupType),
  ).map(operator => ({
    displayValue: ConditionalAction.operatorToDisplayString(operator),
    value: operator,
  }));
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
  allInterviewEntries,
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
    () =>
      allInterviewEntries.find(
        entry => entry.responseKey === action.responseKey,
      ),
    [allInterviewEntries, action],
  );

  // TODO: this is only looking at entries. We also need to look at Skip actions.
  const allResponseKeyOptions = React.useMemo(
    () =>
      allInterviewEntries.map(entry => ({
        displayValue: `${InterviewScreen.getTitle(
          entry.screen,
          defaultLanguage,
        )} - ${entry.name}`,
        value: entry.responseKey,
      })),
    [allInterviewEntries, defaultLanguage],
  );

  const allResponseKeyFieldOptions = React.useMemo(() => {
    // if the selected entry is an Airtable response, then we need to get the
    // table it links to so that we can get all the available fields
    const airtableTable = allAirtableTables.find(
      table =>
        selectedEntry?.responseType ===
          InterviewScreenEntry.ResponseType.AIRTABLE &&
        table.key === selectedEntry.responseTypeOptions.selectedTable,
    );

    // if we couldn't find a table, but the response type is set to 'airtable'
    // then still return an empty array rather than undefined
    if (
      airtableTable === undefined &&
      selectedEntry?.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
    ) {
      return [];
    }

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
        {allResponseKeyFieldOptions ? (
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
          (ConditionalAction.doesOperatorRequireValue(
            action.conditionalOperator,
          ) && (
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
