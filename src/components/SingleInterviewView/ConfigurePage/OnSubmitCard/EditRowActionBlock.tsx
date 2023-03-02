import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as Interview from '../../../../models/Interview';
import * as InterviewSetting from '../../../../models/InterviewSetting';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import FieldToQuestionBlock from './FieldToQuestionBlock';
import type { EditableAction } from './types';
import EntryDropdown from './EntryDropdown';
import InfoIcon from '../../../ui/InfoIcon';

type Props = {
  action: EditableAction;
  actionConfig: SubmissionAction.WithPartialPayload<SubmissionAction.EditRowActionConfig>;
  defaultLanguage: string;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  interview: Interview.UpdateT;
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
};

export default function EditRowActionBlock({
  action,
  actionConfig,
  defaultLanguage,
  entries,
  interview,
  onActionChange,
}: Props): JSX.Element {
  const interviewSetting = interview.interviewSettings.find(
    intSetting => intSetting.type === InterviewSetting.SettingType.AIRTABLE,
  );
  const airtableSettings = interviewSetting?.settings;
  const allTables = React.useMemo(
    () =>
      airtableSettings && airtableSettings?.bases
        ? airtableSettings?.bases?.flatMap(base => base.tables)
        : [],
    [airtableSettings],
  );

  const [selectedIdentifierEntry, setSelectedIdentifierEntry] = React.useState<
    InterviewScreenEntry.T | undefined
  >(undefined);

  const selectedTable = React.useMemo(() => {
    const selectedEntry = entries.find(
      entry => entry.id === actionConfig.payload.entryId,
    );
    return allTables.find(
      table =>
        selectedEntry?.responseType ===
          InterviewScreenEntry.ResponseType.AIRTABLE &&
        table &&
        table.id === selectedEntry?.responseTypeOptions.selectedTable,
    );
  }, [entries, allTables, actionConfig]);

  const entriesWithAirtableLookup = React.useMemo(
    () =>
      entries
        // only show entries that are configured for Airtable lookups
        .filter(
          entry =>
            entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE,
        ),
    [entries],
  );

  const onChangeRowTarget = (entryId: string | undefined): void => {
    const newConfig = {
      type: actionConfig.type,
      payload: { ...actionConfig.payload, entryId },
    };
    setSelectedIdentifierEntry(entries.find(entry => entry.id === entryId));
    onActionChange(action, { ...action, config: newConfig } as EditableAction);
  };

  const onChangeResponseFieldKey = (responseField: string): void => {
    const newConfig = {
      type: actionConfig.type,
      payload: { ...actionConfig.payload, primaryKeyField: responseField },
    };
    onActionChange(action, { ...action, config: newConfig } as EditableAction);
  };

  const onFieldMappingChange = (
    fieldMappings: ReadonlyMap<
      SubmissionAction.FieldId,
      SubmissionAction.EntryResponseLookupConfig
    >,
  ): void => {
    onActionChange(action, { ...action, fieldMappings });
  };

  return (
    <div className="space-y-4">
      {entriesWithAirtableLookup.length === 0 ? (
        <p>There are no questions configured for Airtable yet.</p>
      ) : (
        <>
          <p>
            What response and corresponding row would you like to edit?
            <InfoIcon
              className="ml-2"
              tooltip="Select the question and field that will be used to uniquely identify the row you'd like to edit"
            />
          </p>
          <div className="flex items-center">
            <EntryDropdown
              interview={interview}
              entries={entriesWithAirtableLookup}
              onChangeEntrySelection={onChangeRowTarget}
              selectedEntryId={actionConfig.payload.entryId}
              onChangeResponseFieldKey={onChangeResponseFieldKey}
              selectedResponseFieldKey={actionConfig.payload.primaryKeyField}
              responseFieldPlaceholder="Select an ID field"
              defaultLanguage={defaultLanguage}
            />
            {selectedTable && selectedIdentifierEntry ? (
              <InfoIcon
                className="ml-2"
                tooltip={`This will look up the row in the ${
                  selectedTable.name
                } table, identified by the ${
                  actionConfig.payload.primaryKeyField ??
                  'field you select here'
                } from the response to ${selectedIdentifierEntry.name}`}
              />
            ) : null}
          </div>
        </>
      )}
      {selectedTable && (
        <>
          <p>
            Now map each column you want to edit to the question that should be
            used.
          </p>
          <FieldToQuestionBlock
            interview={interview}
            entries={entries}
            airtableTable={selectedTable}
            fieldMappings={action.fieldMappings}
            onFieldMappingChange={onFieldMappingChange}
            defaultLanguage={defaultLanguage}
          />
        </>
      )}
    </div>
  );
}
