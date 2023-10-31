import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as InterviewScreen from '../../../../models/InterviewScreen';
import * as DataStoreSetting from '../../../../models/DataStoreSetting';
import * as Interview from '../../../../models/Interview';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import Dropdown from '../../../ui/Dropdown';

type Props = {
  allowSpecialValues?: boolean;
  defaultLanguage: string;
  emptyIsAnOption?: boolean;
  emptyOptionText?: string;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  interview: Interview.UpdateT;
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
  defaultLanguage,
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
  interview,
}: Props): JSX.Element {
  const [isEmptyValueSelected, setIsEmptyValueSelected] = React.useState(
    selectedEntryId === undefined && selectedSpecialValueType === undefined,
  );
  const [isSpecialValueSelected, setIsSpecialValueSelected] = React.useState(
    selectedSpecialValueType !== undefined,
  );

  const interviewSetting = interview?.interviewSettings.find(
    intSetting => intSetting.type === DataStoreSetting.DataStoreType.AIRTABLE,
  );
  const airtableSettings = interviewSetting?.settings;

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
        displayValue: `${InterviewScreen.getTitle(
          entry.screen,
          defaultLanguage,
        )} - ${entry.name}`,
      })),
    );
  }, [
    defaultLanguage,
    entries,
    allowSpecialValues,
    emptyIsAnOption,
    emptyOptionText,
  ]);

  const airtableFieldOptions = React.useMemo(() => {
    if (
      selectedEntry &&
      selectedEntry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
    ) {
      const { selectedTable } = selectedEntry.responseTypeOptions;
      const airtableFields = airtableSettings?.bases
        ?.flatMap(base => base.tables)
        .find(table => table?.id === selectedTable)?.fields;
      return airtableFields?.map(field => ({
        displayValue: field.name,
        // interestingly, airtable seems to key the fields by their name
        // rather than ID
        value: field.name,
      }));
    }

    return undefined;
  }, [airtableSettings, selectedEntry]);

  let entryIdToDisplay = selectedEntryId;
  if (isSpecialValueSelected) {
    entryIdToDisplay = SPECIAL_OPTION_ID;
  } else if (isEmptyValueSelected && emptyIsAnOption) {
    entryIdToDisplay = EMPTY_ENTRY_ID;
  }

  return (
    <div className="flex space-x-2">
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
          placeholder={responseFieldPlaceholder}
          options={airtableFieldOptions}
          onChange={onChangeResponseFieldKey}
          value={selectedResponseFieldKey}
        />
      ) : null}
      {isSpecialValueSelected ? (
        <Dropdown
          placeholder="Select special value"
          options={SPECIAL_VALUE_OPTIONS}
          onChange={onChangeSpecialValueType}
          value={selectedSpecialValueType}
        />
      ) : null}
    </div>
  );
}
