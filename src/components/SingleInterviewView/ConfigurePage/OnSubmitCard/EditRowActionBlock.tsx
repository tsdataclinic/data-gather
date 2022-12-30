import * as React from 'react';
import { EditRowAction } from './types';
import * as Interview from '../../../../models/Interview';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';

type Props = {
  action: EditRowAction;
  entries: readonly InterviewScreenEntry.WithScreenT[];
  interview: Interview.WithScreensT;
};

export default function EditRowActionBlock({
  action,
  interview,
  entries,
}: Props): JSX.Element {
  const entryOptions = React.useMemo(
    () =>
      entries.map(entry => ({
        value: entry.id,
        displayValue: `${entry.screen.title} - ${entry.name}`,
      })),
    [entries],
  );

  console.log(action, interview);
  return (
    <div className="space-y-4">
      <LabelWrapper label="What row would you like to edit?">
        <Dropdown
          options={entryOptions}
          onChange={() => alert('Not implemented')}
        />
      </LabelWrapper>
      <p>
        Map each column you want to edit to the question that should be used.
      </p>
      <div className="grid grid-cols-4">
        <div>Column</div>
        <div className="col-span-3">Question</div>
      </div>
    </div>
  );
}
