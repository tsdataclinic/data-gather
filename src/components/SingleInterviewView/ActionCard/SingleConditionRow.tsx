import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { Calendar } from 'primereact/calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams } from 'react-router-dom';
import InputText from '../../ui/InputText';
import * as ConditionalAction from '../../../models/ConditionalAction';
import type { EditableEntryWithScreen } from '../types';
import useInterview from '../../../hooks/useInterview';
import Dropdown, { type DropdownOption } from '../../ui/Dropdown';
import * as InterviewSetting from '../../../models/InterviewSetting';
import * as InterviewScreen from '../../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import InfoIcon from '../../ui/InfoIcon';
import Button from '../../ui/Button';

type Props = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  condition: ConditionalAction.SingleCondition;
  defaultLanguage: string;
  onConditionChange: (newCondition: ConditionalAction.SingleCondition) => void;
  onConditionDelete: (
    conditionToDelete: ConditionalAction.SingleCondition,
  ) => void;
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

// The SingleConditionRow doesn't use Form.Input or other Form
// subcomponents because we need more control over how it renders
export default function SingleConditionRow({
  condition,
  allInterviewEntries,
  onConditionChange,
  onConditionDelete,
  defaultLanguage,
}: Props): JSX.Element {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const interviewSetting = interview?.interviewSettings.find(
    intSetting => intSetting.type === InterviewSetting.SettingType.AIRTABLE,
  );
  const airtableSettings = interviewSetting?.settings;
  const bases = airtableSettings?.bases;
  const allAirtableTables = React.useMemo(
    () => bases && bases.flatMap(base => base.tables),
    [bases],
  );

  const selectedEntry = React.useMemo(
    () =>
      allInterviewEntries.find(
        entry => entry.responseKey === condition.responseKey,
      ),
    [allInterviewEntries, condition],
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
    const airtableTable =
      allAirtableTables &&
      allAirtableTables.find(
        table =>
          table &&
          selectedEntry?.responseType ===
            InterviewScreenEntry.ResponseType.AIRTABLE &&
          table.id === selectedEntry?.responseTypeOptions.selectedTable,
      );

    // if we couldn't find a table, but the response type is set to 'airtable'
    // then still return an empty array rather than undefined
    if (
      airtableTable === undefined &&
      selectedEntry?.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
    ) {
      return [];
    }

    return (
      airtableTable?.fields &&
      airtableTable?.fields.map(field => ({
        displayValue: field.name,
        value: field.name,
      }))
    );
  }, [selectedEntry, allAirtableTables]);

  const onOperatorChange = React.useCallback(
    (newOperator: ConditionalAction.ConditionalOperator) => {
      onConditionChange({
        ...condition,
        conditionalOperator: newOperator,
      });
    },
    [condition, onConditionChange],
  );

  const onResponseKeyChange = React.useCallback(
    (newResponseKey: string) => {
      onConditionChange({
        ...condition,
        responseKey: newResponseKey,
      });
    },
    [condition, onConditionChange],
  );

  const onResponseKeyFieldChange = React.useCallback(
    (newResponseKeyLookupField: string) => {
      onConditionChange({
        ...condition,
        responseKeyLookupField: newResponseKeyLookupField,
      });
    },
    [condition, onConditionChange],
  );

  const onConditionalValueChange = React.useCallback(
    (newValue: string) => {
      onConditionChange({
        ...condition,
        value: newValue,
      });
    },
    [condition, onConditionChange],
  );

  const renderValueEditor = (): JSX.Element | null => {
    if (ConditionalAction.isDateOperator(condition.conditionalOperator)) {
      return (
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
            value={condition.value ? new Date(condition.value) : ''}
          />
          <InfoIcon
            tooltip={`An empty date field in the source data will be treated as ${
              process.env.NULL_DATE_OVERRIDE || '1970-01-01'
            }`}
          />
        </>
      );
    }

    if (
      ConditionalAction.doesOperatorRequireValue(condition.conditionalOperator)
    ) {
      return (
        <InputText
          placeholder="Value"
          onChange={onConditionalValueChange}
          value={condition.value ?? ''}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Dropdown
          onChange={onResponseKeyChange}
          placeholder="Select a question"
          value={condition.responseKey}
          options={allResponseKeyOptions}
        />
        {allResponseKeyFieldOptions ? (
          <Dropdown
            onChange={onResponseKeyFieldChange}
            placeholder="Column name"
            value={condition.responseKeyLookupField}
            options={allResponseKeyFieldOptions}
          />
        ) : null}
        <Dropdown
          onChange={onOperatorChange}
          placeholder="Operator"
          value={condition.conditionalOperator}
          options={OPERATOR_OPTIONS}
        />
        {renderValueEditor()}
        <Button unstyled onClick={() => onConditionDelete(condition)}>
          <FontAwesomeIcon
            aria-label="Delete"
            className="text-slate-400 transition-colors duration-200 hover:text-red-500"
            icon={IconType.faX}
          />
        </Button>
      </div>
    </div>
  );
}
