import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import Dropdown from '../../../ui/Dropdown';
import useAppState from '../../../../hooks/useAppState';

type Props = {
  allowSpecialValues?: boolean;
  emptyIsAnOption?: boolean;
  emptyOptionText?: string;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onChangeEntrySelection: (
    entryId: InterviewScreenEntry.Id | undefined,
  ) => void;
  onChangeResponseFieldKey?: (responseFieldId: string) => void;
  onChangeSpecialValueType?: (
    specialValueType: SubmissionAction.SpecialValueType,
  ) => void;
  responseFieldPlaceholder?: string;
  selectedEntryId?: InterviewScreenEntry.Id | undefined;
  /**
   * If the entry stores an object (e.g. an Airtable lookup returns a full
   * record) we also want to choose what field in that object to use. The
   * `selectedResponseFieldKey` is used to index into the response object
   * of the entry.
   */
  selectedResponseFieldKey?: string;
  selectedSpecialValueType?: SubmissionAction.SpecialValueType;
};

const EMPTY_ENTRY_ID = '__EMPTY__';
const SPECIAL_OPTION_ID = '__SPECIAL__';

const SPECIAL_VALUE_OPTIONS = [
  {
    displayValue: "Today's date",
    value: SubmissionAction.SpecialValueType.NOW_DATE,
  },
];

export default function EntryDropdown({
  entries,
  allowSpecialValues,
  selectedEntryId,
  onChangeEntrySelection,
  onChangeResponseFieldKey,
  onChangeSpecialValueType,
  selectedResponseFieldKey,
  responseFieldPlaceholder = 'Select field',
  emptyIsAnOption = false,
  emptyOptionText = 'No selection',
  selectedSpecialValueType,
}: Props): JSX.Element {
  const [isEmptyValueSelected, setIsEmptyValueSelected] = React.useState(
    selectedEntryId === undefined && selectedSpecialValueType === undefined,
  );
  const [isSpecialValueSelected, setIsSpecialValueSelected] = React.useState(
    selectedSpecialValueType !== undefined,
  );

  const { airtableSettings } = useAppState();
  const { bases } = airtableSettings;

  const selectedEntry = React.useMemo(
    () => entries.find(entry => entry.id === selectedEntryId),
    [selectedEntryId, entries],
  );

  const entryOptions = React.useMemo(() => {
    const emptyOptionSingleton = emptyIsAnOption
      ? [
          {
            value: EMPTY_ENTRY_ID,
            displayValue: emptyOptionText,
          },
        ]
      : [];
    const specialOptionSingleton = allowSpecialValues
      ? [
          {
            value: SPECIAL_OPTION_ID,
            displayValue: 'Use special value',
          },
        ]
      : [];

    return emptyOptionSingleton.concat(specialOptionSingleton).concat(
      entries.map(entry => ({
        value: entry.id,
        displayValue: `${entry.screen.title} - ${entry.name}`,
      })),
    );
  }, [entries, allowSpecialValues, emptyIsAnOption, emptyOptionText]);

  const airtableFieldOptions = React.useMemo(() => {
    if (
      selectedEntry &&
      selectedEntry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
    ) {
      const { selectedTable } = selectedEntry.responseTypeOptions;
      const airtableFields = bases
        .flatMap(base => base.tables)
        .find(table => table.key === selectedTable)?.fields;
      return airtableFields?.map(field => ({
        displayValue: field.fieldName,
        // interestingly, airtable seems to key the fields by their name
        // rather than ID
        value: field.fieldName,
      }));
    }

    return undefined;
  }, [bases, selectedEntry]);

  let entryIdToDisplay = selectedEntryId;
  if (isSpecialValueSelected) {
    entryIdToDisplay = SPECIAL_OPTION_ID;
  } else if (isEmptyValueSelected) {
    entryIdToDisplay = EMPTY_ENTRY_ID;
  }

  return (
    <>
      <Dropdown
        placeholder="Select response"
        options={entryOptions}
        onChange={optionId => {
          setIsEmptyValueSelected(optionId === EMPTY_ENTRY_ID);
          setIsSpecialValueSelected(optionId === SPECIAL_OPTION_ID);
          onChangeEntrySelection(
            optionId === EMPTY_ENTRY_ID || optionId === SPECIAL_OPTION_ID
              ? undefined
              : optionId,
          );
        }}
        value={entryIdToDisplay}
      />
      {airtableFieldOptions ? (
        <Dropdown
          className="!ml-2"
          placeholder={responseFieldPlaceholder}
          options={airtableFieldOptions}
          onChange={onChangeResponseFieldKey}
          value={selectedResponseFieldKey}
        />
      ) : null}
      {isSpecialValueSelected ? (
        <Dropdown
          className="!ml-2"
          placeholder="Select special value"
          options={SPECIAL_VALUE_OPTIONS}
          onChange={onChangeSpecialValueType}
          value={selectedSpecialValueType}
        />
      ) : null}
    </>
  );
}
