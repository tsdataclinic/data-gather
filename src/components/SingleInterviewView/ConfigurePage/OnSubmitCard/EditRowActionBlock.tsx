import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import LabelWrapper from '../../../ui/LabelWrapper';
import FieldToQuestionBlock from './FieldToQuestionBlock';
import useAppState from '../../../../hooks/useAppState';
import type { EditableAction } from './types';
import EntryDropdown from './EntryDropdown';

type Props = {
  action: EditableAction;
  actionConfig: SubmissionAction.WithPartialPayload<SubmissionAction.EditRowActionConfig>;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
};

export default function EditRowActionBlock({
  action,
  actionConfig,
  entries,
  onActionChange,
}: Props): JSX.Element {
  const { airtableSettings } = useAppState();
  const allTables = React.useMemo(
    () => airtableSettings.bases.flatMap(base => base.tables),
    [airtableSettings],
  );

  const selectedTable = React.useMemo(() => {
    const selectedEntry = entries.find(
      entry => entry.id === actionConfig.payload.entryId,
    );
    return allTables.find(
      table => table.key === selectedEntry?.responseTypeOptions.selectedTable,
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
        <LabelWrapper label="What row would you like to edit?">
          <EntryDropdown
            entries={entriesWithAirtableLookup}
            onChangeEntrySelection={onChangeRowTarget}
            selectedEntryId={actionConfig.payload.entryId}
            onChangeResponseFieldKey={onChangeResponseFieldKey}
            selectedResponseFieldKey={actionConfig.payload.primaryKeyField}
            responseFieldPlaceholder="Select ID field"
          />
        </LabelWrapper>
      )}
      {selectedTable && (
        <>
          <p>
            Map each column you want to edit to the question that should be
            used.
          </p>
          <FieldToQuestionBlock
            entries={entries}
            airtableTable={selectedTable}
            fieldMappings={action.fieldMappings}
            onFieldMappingChange={onFieldMappingChange}
          />
        </>
      )}
    </div>
  );
}
