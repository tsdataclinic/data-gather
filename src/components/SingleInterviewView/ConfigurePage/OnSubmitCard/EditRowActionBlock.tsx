import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import FieldToQuestionBlock from './FieldToQuestionBlock';
import useAppState from '../../../../hooks/useAppState';
import type { EditableAction } from './types';

type Props = {
  action: EditableAction;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
};

export default function EditRowActionBlock({
  action,
  entries,
  onActionChange,
}: Props): JSX.Element {
  const { airtableSettings } = useAppState();
  const allTables = React.useMemo(
    () => airtableSettings.bases.flatMap(base => base.tables),
    [airtableSettings],
  );

  const selectedTable = React.useMemo(() => {
    const selectedEntry = entries.find(entry => entry.id === action.target);
    return allTables.find(
      table => table.key === selectedEntry?.responseTypeOptions.selectedTable,
    );
  }, [entries, allTables, action.target]);

  const entryOptions = React.useMemo(
    () =>
      entries
        // only show entries that are configured for Airtable lookups
        .filter(
          entry =>
            entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE,
        )
        .map(entry => ({
          value: entry.id,
          displayValue: `${entry.screen.title} - ${entry.name}`,
        })),
    [entries],
  );

  const onChangeRowTarget = (entryId: string): void => {
    onActionChange(action, { ...action, target: entryId });
  };

  const onFieldMappingChange = (
    fieldMappings: ReadonlyMap<
      SubmissionAction.FieldId,
      InterviewScreenEntry.Id | undefined
    >,
  ): void => {
    onActionChange(action, { ...action, fieldMappings });
  };

  return (
    <div className="space-y-4">
      {entryOptions.length === 0 ? (
        <p>There are no questions configured for Airtable yet.</p>
      ) : (
        <LabelWrapper label="What row would you like to edit?">
          <Dropdown
            options={entryOptions}
            onChange={onChangeRowTarget}
            value={action.target}
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
