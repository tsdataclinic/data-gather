import * as React from 'react';
import { EditRowAction } from './types';
import * as Interview from '../../../../models/Interview';
import * as InterviewScreenEntry from '../../../../models/InterviewScreenEntry';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';

type Props = {
  action: EditRowAction;
  interview: Interview.WithScreensT;
};

const interviewEntries: readonly InterviewScreenEntry.T[] = [];

export default function EditRowActionBlock({
  action,
  interview,
}: Props): JSX.Element {
  console.log(action, interview);
  const entryOptions = React.useMemo(
    () =>
      interviewEntries.map(entry => ({
        displayValue: entry.name,
        value: entry.id,
      })),
    [],
  );

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
