import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { v4 as uuidv4 } from 'uuid';
import * as Interview from '../../../../models/Interview';
import Button from '../../../ui/Button';
import Dropdown from '../../../ui/Dropdown';
import LabelWrapper from '../../../ui/LabelWrapper';
import assertUnreachable from '../../../../util/assertUnreachable';
import {
  ON_SUBMIT_ACTION_TYPES,
  actionTypeToDisplayName,
  OnSubmitActionType,
  OnSubmitAction,
  EditRowAction,
  InsertRowAction,
} from './types';
import EditRowActionBlock from './EditRowActionBlock';
import InsertRowActionBlock from './InsertRowActionBlock';
import useInterviewService from '../../../../hooks/useInterviewService';

type Props = {
  interview: Interview.WithScreensAndActions;
};

const ACTION_TYPE_OPTIONS = ON_SUBMIT_ACTION_TYPES.map(actionType => ({
  displayValue: actionTypeToDisplayName(actionType),
  value: actionType,
}));

function createDefaultEditRowAction(): EditRowAction {
  return {
    id: uuidv4(),
    type: OnSubmitActionType.EDIT_ROW,
    rowTarget: undefined,
    columnMappings: new Map(),
  };
}

function createDefaultInsertRowAction(): InsertRowAction {
  return {
    id: uuidv4(),
    type: OnSubmitActionType.INSERT_ROW,
    tableTarget: undefined,
    columnMappings: new Map(),
  };
}

export default function OnSubmitCard({ interview }: Props): JSX.Element {
  const interviewService = useInterviewService();
  const { data: entries } = useQuery({
    queryKey: ['interview', interview.id, 'entries'],
    queryFn: () => interviewService.interviewAPI.getAllEntries(interview.id),
  });

  // TODO: eventually this should be stored in the interview itself and loaded
  // from the backend
  const [actions, setActions] = React.useState<readonly OnSubmitAction[]>([]);

  const onAddClick = React.useCallback((): void => {
    setActions(prevActions => prevActions.concat(createDefaultEditRowAction()));
  }, []);

  const onActionChange = (newAction: OnSubmitAction): void => {
    setActions(prevActions =>
      prevActions.map(action =>
        newAction.id === action.id ? newAction : action,
      ),
    );
  };

  const renderActionBlock = (action: OnSubmitAction): JSX.Element => {
    switch (action.type) {
      case OnSubmitActionType.EDIT_ROW:
        return (
          <EditRowActionBlock
            action={action}
            entries={entries ?? []}
            onActionChange={onActionChange}
          />
        );
      case OnSubmitActionType.INSERT_ROW:
        return (
          <InsertRowActionBlock
            action={action}
            entries={entries ?? []}
            onActionChange={onActionChange}
          />
        );
      default:
        return assertUnreachable(action);
    }
  };

  return (
    <div className="grid grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg">
      <div className="flex h-fit items-center space-x-3">
        <FontAwesomeIcon size="1x" icon={IconType.faWrench} />
        <h2>On submission</h2>
      </div>
      <div className="col-span-3 space-y-4">
        {actions.map(action => (
          <div
            key={action.id}
            className="space-y-4 rounded border border-gray-300 bg-gray-50 p-4 text-slate-800"
          >
            <LabelWrapper label="Action type">
              <Dropdown
                value={action.type}
                options={ACTION_TYPE_OPTIONS}
                onChange={actionType => {
                  const defaultAction =
                    actionType === OnSubmitActionType.EDIT_ROW
                      ? createDefaultEditRowAction()
                      : createDefaultInsertRowAction();
                  // reuse the same id so that we edit the existing action
                  onActionChange({ ...defaultAction, id: action.id });
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
