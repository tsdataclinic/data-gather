import invariant from 'invariant';
import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import Dropdown from '../../ui/Dropdown';
import LabelWrapper from '../../ui/LabelWrapper';
import assertUnreachable from '../../../util/assertUnreachable';
import useInterviewScreens from '../../../hooks/useInterviewScreens';

const ACTION_TYPE_OPTIONS = ConditionalAction.ACTION_TYPES.map(actionType => ({
  displayValue: ConditionalAction.actionTypeToDisplayString(actionType),
  value: actionType,
}));

type ActionConfig = ConditionalAction.T['actionConfig'];

type Props = {
  actionConfig: ActionConfig;
  interview: Interview.T;
  onActionConfigChange: (actionConfig: ActionConfig) => void;
};

/**
 * This component is used to configure a conditional action's payload.
 * It renders differently based off of what the action type is
 */
export default function ActionConfigEditor({
  actionConfig,
  onActionConfigChange,
  interview,
}: Props): JSX.Element {
  const screens = useInterviewScreens(interview.id);
  const onActionTypeChange = (
    newActionType: ConditionalAction.ActionType,
  ): void => {
    onActionConfigChange(
      ConditionalAction.createDefaultActionConfig(newActionType),
    );
  };

  const onActionPayloadChange = (
    actionType: ConditionalAction.ActionType,
    payload: ConditionalAction.T['actionConfig']['payload'],
  ): void => {
    switch (actionType) {
      case ConditionalAction.ActionType.Push:
        invariant(
          typeof payload === 'string',
          'Action payload must be of type string',
        );
        onActionConfigChange({
          type: actionType,
          payload: [payload],
        });
        break;
      case ConditionalAction.ActionType.Skip:
      case ConditionalAction.ActionType.Checkpoint:
      case ConditionalAction.ActionType.Milestone:
      case ConditionalAction.ActionType.Restore:
        // TODO: needs implementation
        break;
      default:
        assertUnreachable(actionType);
    }
  };

  const screenOptions = React.useMemo(
    () =>
      screens
        ? screens.map(screen => ({
            value: screen.id,
            displayValue: screen.title,
          }))
        : [],
    [screens],
  );

  const renderEditor = (): JSX.Element | null => {
    switch (actionConfig.type) {
      case ConditionalAction.ActionType.Push:
        // TODO: we only allow a single screen to be pushed for now. This needs
        // to be updated once we have a multi-select dropdown component.
        return (
          <Dropdown
            onChange={(newScreenId: string) =>
              onActionPayloadChange(
                ConditionalAction.ActionType.Push,
                newScreenId,
              )
            }
            defaultButtonLabel="No payload selected"
            value={actionConfig.payload[0]}
            options={screenOptions}
          />
        );
      case ConditionalAction.ActionType.Skip:
      case ConditionalAction.ActionType.Checkpoint:
      case ConditionalAction.ActionType.Milestone:
      case ConditionalAction.ActionType.Restore:
        // TODO: remove this once this UI is finished
        // eslint-disable-next-line no-alert
        alert(
          `Payload editor for ${actionConfig.type} has not been implemented`,
        );
        return null;
      default:
        return assertUnreachable(actionConfig);
    }
  };

  return (
    <>
      <LabelWrapper inline label="Action" labelTextClassName="w-20">
        <Dropdown
          onChange={onActionTypeChange}
          defaultButtonLabel="Action type"
          value={actionConfig.type}
          options={ACTION_TYPE_OPTIONS}
        />
      </LabelWrapper>
      <LabelWrapper inline label="Payload" labelTextClassName="w-20">
        {renderEditor()}
      </LabelWrapper>
    </>
  );
}
