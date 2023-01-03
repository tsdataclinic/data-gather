import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import ColumnToQuestionMapBlock from './ColumnToQuestionMapBlock';
import useAppState from '../../../../hooks/useAppState';
import type { EditRowAction, EntryId } from './types';

type Props = {
  action: EditRowAction;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onActionChange: (newAction: EditRowAction) => void;
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
    const selectedEntry = entries.find(entry => entry.id === action.rowTarget);
    return allTables.find(
      table => table.key === selectedEntry?.responseTypeOptions.selectedTable,
    );
  }, [entries, allTables, action.rowTarget]);

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
    onActionChange({ ...action, rowTarget: entryId });
  };

  const onColumnMappingChange = (
    columnMappings: ReadonlyMap<string, EntryId | undefined>,
  ): void => {
    onActionChange({ ...action, columnMappings });
  };

  return (
    <div className="space-y-4">
      <LabelWrapper label="What row would you like to edit?">
        <Dropdown
          options={entryOptions}
          onChange={onChangeRowTarget}
          value={action.rowTarget}
        />
      </LabelWrapper>
      {selectedTable && (
        <>
          <p>
            Map each column you want to edit to the question that should be
            used.
          </p>
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