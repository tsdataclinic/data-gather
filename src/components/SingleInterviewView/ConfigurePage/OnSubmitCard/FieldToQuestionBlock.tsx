import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import { AirtableTableConfig } from '../../../../store/appReducer';
import Dropdown from '../../../ui/Dropdown';

type Props = {
  airtableTable: AirtableTableConfig;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  fieldMappings: ReadonlyMap<
    SubmissionAction.FieldId,
    InterviewScreenEntry.Id | undefined
  >;
  onFieldMappingChange: (
    newMappings: ReadonlyMap<
      SubmissionAction.FieldId,
      InterviewScreenEntry.Id | undefined
    >,
  ) => void;
};

const DO_NOT_UPDATE_FLAG = '__DO_NOT_UPDATE__';

export default function ColumnToQuestionMapBlock({
  airtableTable,
  entries,
  fieldMappings,
  onFieldMappingChange,
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

  const onMappingChange = (
    fieldId: SubmissionAction.FieldId,
    entryId: string,
  ): void => {
    const newMappings = new Map([...fieldMappings.entries()]).set(
      fieldId,
      entryId === DO_NOT_UPDATE_FLAG ? undefined : entryId,
    );
    onFieldMappingChange(newMappings);
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
          const fieldID = field.fieldID as SubmissionAction.FieldId;
          const entryId = fieldMappings.get(fieldID);

          return (
            <React.Fragment key={fieldID}>
              <div>{field.fieldName}</div>
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
