import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
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
} from './types';
import EditRowActionBlock from './EditRowActionBlock';

type Props = {
  interview: Interview.WithScreensT;
};

const ACTION_TYPE_OPTIONS = ON_SUBMIT_ACTION_TYPES.map(actionType => ({
  displayValue: actionTypeToDisplayName(actionType),
  value: actionType,
}));

export default function OnSubmitCard({ interview }: Props): JSX.Element {
  const [actions, setActions] = React.useState<readonly OnSubmitAction[]>([]);

  const onAddClick = (): void => {
    setActions(prevActions =>
      prevActions.concat({
        id: uuidv4(),
        type: OnSubmitActionType.EDIT_ROW,
        rowTarget: undefined,
        columnMappings: new Map(),
      }),
    );
  };

  const renderActionBlock = (action: OnSubmitAction): JSX.Element => {
    switch (action.type) {
      case OnSubmitActionType.EDIT_ROW:
        return <EditRowActionBlock action={action} interview={interview} />;
      case OnSubmitActionType.INSERT_ROW:
        return <div>Insert action</div>;
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
                onChange={() => alert('Not implemented')}
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
