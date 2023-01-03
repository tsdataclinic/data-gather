import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import { AirtableSettings } from '../../../../store/appReducer';
import Dropdown from '../../../ui/Dropdown';

type Props = {
  airtableSettings: AirtableSettings;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  entryToWrite: InterviewScreenEntry.WithScreenT;
};

export default function ColumnToQuestionMapBlock({
  airtableSettings,
  entries,
  entryToWrite,
}: Props): JSX.Element {
  const { selectedTable, selectedBase } = entryToWrite.responseTypeOptions;

  const table = airtableSettings.bases
    .find(base => base.name === selectedBase)
    ?.tables.find(tblObj => tblObj.key === selectedTable);
  console.log(entries);

  const entryOptions = React.useMemo(
    () =>
      [
        {
          value: '__DO_NOT_UPDATE__',
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

  const tableName = table?.name ?? 'Table not found';
  const fields = table?.fields ?? [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Table: {tableName}</h3>
      <div className="grid grid-cols-4 gap-y-4">
        <div>Column</div>
        <div className="col-span-3">Question</div>
        {fields.map(field => (
          <React.Fragment key={field.fieldID}>
            <div>{field.fieldName}</div>
            <div className="col-span-3">
              <Dropdown options={entryOptions} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
