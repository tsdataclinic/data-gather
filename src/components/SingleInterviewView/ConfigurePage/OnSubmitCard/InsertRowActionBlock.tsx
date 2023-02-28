import * as React from 'react';
import { useParams } from 'react-router-dom';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import FieldToQuestionBlock from './FieldToQuestionBlock';
import type { EditableAction } from './types';
import useInterview from '../../../../hooks/useInterview';
import { InterviewSettingType } from '../../../../api';

type Props = {
  action: EditableAction;
  actionConfig: SubmissionAction.WithPartialPayload<SubmissionAction.InsertRowActionConfig>;
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
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const interviewSetting = interview?.interviewSettings.find(
    intSetting => intSetting.type === InterviewSettingType.AIRTABLE,
  );
  const settings = interviewSetting?.settings;
  const airtableSettings = settings?.get(InterviewSettingType.AIRTABLE);

  const allTables = React.useMemo(
    () =>
      airtableSettings && airtableSettings.bases
        ? airtableSettings?.bases?.flatMap(base => base.tables)
        : [],
    [airtableSettings],
  );

  const selectedTable = React.useMemo(
    () =>
      allTables.find(table => table?.id === actionConfig.payload.tableTarget),
    [allTables, actionConfig],
  );

  const tableOptions = React.useMemo(
    () =>
      allTables.map(table => ({
        value: table ? table.id : '',
        displayValue: table ? table.name : '',
      })),
    [allTables],
  );

  const onChangeTableTarget = (tableId: string): void => {
    const newConfig = {
      type: actionConfig.type,
      payload: {
        ...action.config.payload,
        baseTarget: '',
        tableTarget: tableId,
      },
    };

    onActionChange(action, { ...action, config: newConfig });
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
      <LabelWrapper label="Airtable table">
        <Dropdown
          value={actionConfig.payload.tableTarget}
          options={tableOptions}
          onChange={onChangeTableTarget}
          placeholder="Select table"
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
