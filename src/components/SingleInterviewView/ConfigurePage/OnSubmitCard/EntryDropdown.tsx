import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import useAppState from '../../../../hooks/useAppState';

type Props = {
  emptyIsAnOption?: boolean;
  emptyOptionText?: string;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onChangeEntryResponseField?: (responseFieldId: string) => void;
  onChangeEntrySelection: (
    entryId: InterviewScreenEntry.Id | undefined,
  ) => void;
  /**
   * If the entry stores an object (e.g. an Airtable lookup returns a full
   * record) we also want to choose what field in that object to use. The
   * `responseFieldKey` is used to index into the response object of the
   * entry.
   */
  responseFieldKey?: string;
  responseFieldPlaceholder?: string;
  selectedEntryId?: InterviewScreenEntry.Id | undefined;
};

const EMPTY_OPTION_ID = '__EMPTY__';

export default function EntryDropdown({
  entries,
  selectedEntryId,
  onChangeEntrySelection,
  onChangeEntryResponseField,
  responseFieldKey,
  responseFieldPlaceholder = 'Select field',
  emptyIsAnOption = false,
  emptyOptionText = 'No selection',
}: Props): JSX.Element {
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
            value: EMPTY_OPTION_ID,
            displayValue: emptyOptionText,
          },
        ]
      : [];

    return emptyOptionSingleton.concat(
      entries.map(entry => ({
        value: entry.id,
        displayValue: `${entry.screen.title} - ${entry.name}`,
      })),
    );
  }, [entries, emptyIsAnOption, emptyOptionText]);

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

  return (
    <>
      <Dropdown
        placeholder="Select response"
        options={entryOptions}
        onChange={onChangeEntrySelection}
        value={
          selectedEntryId === undefined && emptyIsAnOption
            ? EMPTY_OPTION_ID
            : selectedEntryId
        }
      />
      {airtableFieldOptions ? (
        <Dropdown
          className="!ml-2"
          placeholder={responseFieldPlaceholder}
          options={airtableFieldOptions}
          onChange={onChangeEntryResponseField}
          value={responseFieldKey}
        />
      ) : null}
    </>
  );
}
