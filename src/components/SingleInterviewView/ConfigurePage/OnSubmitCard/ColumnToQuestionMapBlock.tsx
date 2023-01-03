import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import { AirtableTableConfig } from '../../../../store/appReducer';
import Dropdown from '../../../ui/Dropdown';
import type { EntryId } from './types';

type Props = {
  airtableTable: AirtableTableConfig;
  columnMappings: ReadonlyMap<string, EntryId | undefined>;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  onColumnMappingChange: (
    newMappings: ReadonlyMap<string, EntryId | undefined>,
  ) => void;
};

const DO_NOT_UPDATE_FLAG = '__DO_NOT_UPDATE__';

export default function ColumnToQuestionMapBlock({
  airtableTable,
  entries,
  columnMappings,
  onColumnMappingChange,
}: Props): JSX.Element {
  const entryOptions = React.useMemo(
    () =>
      [
        {
          value: DO_NOT_UPDATE_FLAG,
          displayValue: 'Do not update',
        },
      ].concat(
        entries.map(entry => ({
          value: entry.id,
          displayValue: `${entry.screen.title} - ${entry.name}`,
        })),
      ),
    [entries],
  );

  const onMappingChange = (fieldId: string, entryId: string): void => {
    const newMappings = new Map([...columnMappings.entries()]).set(
      fieldId,
      entryId === DO_NOT_UPDATE_FLAG ? undefined : entryId,
    );
    onColumnMappingChange(newMappings);
  };

  const tableName = airtableTable?.name ?? 'Table not found';
  const fields = airtableTable?.fields ?? [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Table: {tableName}</h3>
      <div className="grid grid-cols-4 gap-y-4">
        <div>Column</div>
        <div className="col-span-3">Question</div>
        {fields.map(field => {
          const { fieldID, fieldName } = field;
          const entryId = columnMappings.get(fieldID);

          return (
            <React.Fragment key={fieldID}>
              <div>{fieldName}</div>
              <div className="col-span-3">
                <Dropdown
                  options={entryOptions}
                  onChange={newEntryId => onMappingChange(fieldID, newEntryId)}
                  value={entryId ?? DO_NOT_UPDATE_FLAG}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
