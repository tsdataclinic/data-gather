import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import { AirtableSettings } from '../../../../store/appReducer';
import Dropdown from '../../../ui/Dropdown';
import type { EntryId } from './types';

type Props = {
  airtableSettings: AirtableSettings;
  columnMappings: ReadonlyMap<string, EntryId | undefined>;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  entryToWrite: InterviewScreenEntry.WithScreenT;
  onColumnMappingChange: (
    newMappings: ReadonlyMap<string, EntryId | undefined>,
  ) => void;
};

const DO_NOT_UPDATE_FLAG = '__DO_NOT_UPDATE__';

export default function ColumnToQuestionMapBlock({
  airtableSettings,
  entries,
  entryToWrite,
  columnMappings,
  onColumnMappingChange,
}: Props): JSX.Element {
  const { selectedTable, selectedBase } = entryToWrite.responseTypeOptions;

  const table = airtableSettings.bases
    .find(base => base.name === selectedBase)
    ?.tables.find(tblObj => tblObj.key === selectedTable);

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

  const tableName = table?.name ?? 'Table not found';
  const fields = table?.fields ?? [];

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
