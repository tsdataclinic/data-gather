import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Interview from '../../../../models/Interview';
import * as SubmissionAction from '../../../../models/SubmissionAction';
import Button from '../../../ui/Button';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import assertUnreachable from '../../../../util/assertUnreachable';
import EditRowActionBlock from './EditRowActionBlock';
import InsertRowActionBlock from './InsertRowActionBlock';
import useInterviewService from '../../../../hooks/useInterviewService';
import type { EditableAction } from './types';

type Props = {
  interview: Interview.UpdateT;
  onInterviewChange: (interview: Interview.UpdateT) => void;
};

const ACTION_TYPE_OPTIONS = SubmissionAction.ACTION_TYPES.map(actionType => ({
  displayValue: SubmissionAction.actionTypeToDisplayName(actionType),
  value: actionType,
}));

export default function OnSubmitCard({
  interview,
  onInterviewChange,
}: Props): JSX.Element {
  const interviewService = useInterviewService();
  const { data: entries } = useQuery({
    queryKey: ['interview', interview.id, 'entries'],
    queryFn: () => interviewService.interviewAPI.getAllEntries(interview.id),
  });

  const onAddClick = (): void => {
    onInterviewChange({
      ...interview,
      submissionActions: interview.submissionActions.concat(
        SubmissionAction.create({
          interviewId: interview.id,
          order: interview.submissionActions.length + 1,
          type: SubmissionAction.ActionType.EDIT_ROW,
        }),
      ),
    });
  };

  const onActionChange = (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ): void => {
    onInterviewChange({
      ...interview,
      submissionActions: interview.submissionActions.map(action =>
        action === actionToReplace ? newAction : action,
      ),
    });
  };

  const renderActionBlock = (action: EditableAction): JSX.Element => {
    switch (action.type) {
      case SubmissionAction.ActionType.EDIT_ROW:
        return (
          <EditRowActionBlock
            action={action}
            entries={entries ?? []}
            onActionChange={onActionChange}
          />
        );
      case SubmissionAction.ActionType.INSERT_ROW:
        return (
          <InsertRowActionBlock
            action={action}
            entries={entries ?? []}
            onActionChange={onActionChange}
          />
        );
      default:
        return assertUnreachable(action.type);
    }
  };

  return (
    <div className="grid grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg">
      <div className="flex h-fit items-center space-x-3">
        <FontAwesomeIcon size="1x" icon={IconType.faWrench} />
        <h2>On submission</h2>
      </div>
      <div className="col-span-3 space-y-4">
        {interview.submissionActions.map(action => (
          <div
            key={'id' in action ? action.id : action.tempId}
            className="space-y-4 rounded border border-gray-300 bg-gray-50 p-4 text-slate-800"
          >
            <LabelWrapper label="Action type">
              <Dropdown
                value={action.type}
                options={ACTION_TYPE_OPTIONS}
                onChange={actionType => {
                  // reuse the same id so that we edit the existing action
                  onActionChange(
                    action,
                    SubmissionAction.create({
                      type: actionType,
                      order: action.order,
                      interviewId: action.interviewId,
                    }),
                  );
                }}
              />
            </LabelWrapper>
            {renderActionBlock(action)}
          </div>
        ))}
        <Button intent="primary" onClick={onAddClick}>
          + Add action
        </Button>
      </div>
    </div>
  );
}
