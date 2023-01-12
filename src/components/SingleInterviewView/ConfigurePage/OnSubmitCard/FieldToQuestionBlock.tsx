import * as React from 'react';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import { AirtableTableConfig } from '../../../../store/appReducer';
import EntryDropdown from './EntryDropdown';

type Props = {
  airtableTable: AirtableTableConfig;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  fieldMappings: SubmissionAction.T['fieldMappings'];
  onFieldMappingChange: (
    newMappings: ReadonlyMap<
      SubmissionAction.FieldId,
      SubmissionAction.EntryResponseLookupConfig
    >,
  ) => void;
};

export default function ColumnToQuestionMapBlock({
  airtableTable,
  entries,
  fieldMappings,
  onFieldMappingChange,
}: Props): JSX.Element {
  const onMappingChange = (
    fieldId: SubmissionAction.FieldId,
    entryLookupConfig: SubmissionAction.EntryResponseLookupConfig | undefined,
  ): void => {
    const newMappings = new Map([...fieldMappings.entries()]);
    if (entryLookupConfig === undefined) {
      newMappings.delete(fieldId);
    } else {
      newMappings.set(fieldId, entryLookupConfig);
    }
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
          const entryLookupConfig = fieldMappings.get(fieldID);

          return (
            <React.Fragment key={fieldID}>
              <div>{field.fieldName}</div>
              <div className="col-span-3">
                <EntryDropdown
                  emptyIsAnOption
                  emptyOptionText="Do not update"
                  entries={entries}
                  selectedEntryId={entryLookupConfig?.entryId}
                  responseFieldKey={entryLookupConfig?.responseFieldKey}
                  onChangeEntrySelection={newEntryId =>
                    onMappingChange(
                      fieldID,
                      newEntryId
                        ? {
                            ...entryLookupConfig,
                            entryId: newEntryId,
                          }
                        : undefined,
                    )
                  }
                  onChangeEntryResponseField={responseFieldKey =>
                    onMappingChange(
                      fieldID,
                      entryLookupConfig
                        ? {
                            ...entryLookupConfig,
                            responseFieldKey,
                          }
                        : undefined,
                    )
                  }
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
