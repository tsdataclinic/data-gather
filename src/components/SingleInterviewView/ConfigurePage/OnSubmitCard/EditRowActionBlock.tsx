import * as React from 'react';
import { EditRowAction } from './types';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import ColumnToQuestionMapBlock from './ColumnToQuestionMapBlock';
import useAppState from '../../../../hooks/useAppState';

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
  const selectedEntry = React.useMemo(
    () => entries.find(entry => entry.id === action.rowTarget),
    [entries, action.rowTarget],
  );

  const entryOptions = React.useMemo(
    () =>
      entries
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
    onActionChange({
      ...action,
      rowTarget: entryId,
    });
  };

  return (
    <div className="space-y-4">
      <LabelWrapper label="What row would you like to edit?">
        <Dropdown options={entryOptions} onChange={onChangeRowTarget} />
      </LabelWrapper>
      {selectedEntry && (
        <>
          <p>
            Map each column you want to edit to the question that should be
            used.
          </p>
          <ColumnToQuestionMapBlock
            airtableSettings={airtableSettings}
            entries={entries}
            entryToWrite={selectedEntry}
          />
        </>
      )}
    </div>
  );
}
