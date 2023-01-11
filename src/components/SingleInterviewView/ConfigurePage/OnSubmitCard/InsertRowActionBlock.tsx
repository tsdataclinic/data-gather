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

  const selectedTable = React.useMemo(
    () => allTables.find(table => table.key === action.target),
    [allTables, action.target],
  );

  const tableOptions = React.useMemo(
    () =>
      allTables.map(table => ({
        value: table.key,
        displayValue: table.name,
      })),
    [allTables],
  );

  const onChangeTableTarget = (tableId: string): void => {
    onActionChange(action, { ...action, target: tableId });
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
      <LabelWrapper label="Airtable table">
        <Dropdown
          value={action.target}
          options={tableOptions}
          onChange={onChangeTableTarget}
        />
      </LabelWrapper>
      {selectedTable && (
        <>
          <p>Map each column to the question response that should be used.</p>
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
