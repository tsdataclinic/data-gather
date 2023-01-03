import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import ColumnToQuestionMapBlock from './ColumnToQuestionMapBlock';
import useAppState from '../../../../hooks/useAppState';
import type { InsertRowAction, EntryId } from './types';

type Props = {
  action: InsertRowAction;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onActionChange: (newAction: InsertRowAction) => void;
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
    () => allTables.find(table => table.key === action.tableTarget),
    [allTables, action.tableTarget],
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
    onActionChange({ ...action, tableTarget: tableId });
  };

  const onColumnMappingChange = (
    columnMappings: ReadonlyMap<string, EntryId | undefined>,
  ): void => {
    onActionChange({ ...action, columnMappings });
  };

  return (
    <div className="space-y-4">
      <LabelWrapper label="Airtable table">
        <Dropdown options={tableOptions} onChange={onChangeTableTarget} />
      </LabelWrapper>
      {selectedTable && (
        <>
          <p>Map each column to the question response that should be used.</p>
          <ColumnToQuestionMapBlock
            entries={entries}
            airtableTable={selectedTable}
            columnMappings={action.columnMappings}
            onColumnMappingChange={onColumnMappingChange}
          />
        </>
      )}
    </div>
  );
}
