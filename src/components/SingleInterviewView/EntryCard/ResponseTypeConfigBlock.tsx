import type { EditableEntry } from '../types';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import assertUnreachable from '../../../util/assertUnreachable';
import AirtableFieldSelector from './AirtableFieldSelector';
import SingleSelectEditor from './SingleSelectEditor';

type Props = {
  entry: EditableEntry;
  onEntryChange: (
    entryToReplace: EditableEntry,
    newEntry: EditableEntry,
  ) => void;
};

export default function ResponseTypeConfigBlock({
  entry,
  onEntryChange,
}: Props): JSX.Element | null {
  const { responseType, responseTypeOptions } = entry;
  switch (responseType) {
    case InterviewScreenEntry.ResponseType.AIRTABLE:
      return (
        <AirtableFieldSelector
          fieldSelectorLabel="Fields to search by"
          airtableConfig={responseTypeOptions}
          onAirtableConfigurationChange={(
            newConfig: InterviewScreenEntry.AirtableOptions,
          ) => {
            onEntryChange(entry, {
              ...entry,
              responseTypeOptions: newConfig,
            });
          }}
        />
      );
    case InterviewScreenEntry.ResponseType.SINGLE_SELECT:
      return (
        <SingleSelectEditor
          selectionConfig={responseTypeOptions}
          onSelectionConfigurationChange={(
            newConfig: InterviewScreenEntry.SingleSelectOptions,
          ) => {
            onEntryChange(entry, {
              ...entry,
              responseTypeOptions: newConfig,
            });
          }}
        />
      );
    case InterviewScreenEntry.ResponseType.TEXT:
    case InterviewScreenEntry.ResponseType.EMAIL:
    case InterviewScreenEntry.ResponseType.NUMBER:
    case InterviewScreenEntry.ResponseType.PHONE_NUMBER:
    case InterviewScreenEntry.ResponseType.BOOLEAN:
      return null;
    default:
      assertUnreachable(responseType, { throwError: false });
      return <div>This response type is not supported yet.</div>;
  }
}
