import type { EditableEntry } from '../types';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import * as Interview from '../../../models/Interview';
import assertUnreachable from '../../../util/assertUnreachable';
import AirtableFieldSelector from './AirtableFieldSelector';
import SingleSelectEditor from './SingleSelectEditor';

type Props = {
  entry: EditableEntry;
  interview: Interview.WithScreensAndActions;
  onEntryChange: (
    entryToReplace: EditableEntry,
    newEntry: EditableEntry,
  ) => void;
};

export default function ResponseTypeConfigBlock({
  entry,
  onEntryChange,
  interview,
}: Props): JSX.Element | null {
  const { responseType, responseTypeOptions } = entry;
  switch (responseType) {
    case 'airtable':
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
    case 'single_select':
      return (
        <SingleSelectEditor
          interview={interview}
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
    case 'text':
    case 'email':
    case 'number':
    case 'phone_number':
    case 'boolean':
      return null;
    default:
      assertUnreachable(responseType, { throwError: false });
      return <div>This response type is not supported yet.</div>;
  }
}
