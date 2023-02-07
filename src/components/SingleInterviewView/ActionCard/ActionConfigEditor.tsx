import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as Screen from '../../../models/InterviewScreen';
import Dropdown from '../../ui/Dropdown';
import LabelWrapper from '../../ui/LabelWrapper';
import assertUnreachable from '../../../util/assertUnreachable';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import InputText from '../../ui/InputText';

// TODO: eventually this should be removed because all action types should be
// fully implemented.
const UNIMPLEMENTED_ACTION_TYPES = new Set([
  ConditionalAction.ActionType.CHECKPOINT,
  ConditionalAction.ActionType.MILESTONE,
  ConditionalAction.ActionType.RESTORE,
  ConditionalAction.ActionType.SKIP,
]);

const ACTION_TYPE_OPTIONS = ConditionalAction.ACTION_TYPES.filter(
  actionType => !UNIMPLEMENTED_ACTION_TYPES.has(actionType),
).map(actionType => ({
  displayValue: ConditionalAction.actionTypeToDisplayString(actionType),
  value: actionType,
}));

type ActionConfig = ConditionalAction.T['actionConfig'];

type Props = {
  action: ConditionalAction.T | ConditionalAction.CreateT;
  interview: Interview.T;
  interviewScreen: Screen.T;
  isAlwaysExecuteChecked: boolean;
  onActionConfigChange: (actionConfig: ActionConfig) => void;
};

/**
 * This component is used to configure a conditional action's payload.
 * It renders differently based off of what the action type is
 */
export default function ActionConfigEditor({
  action,
  onActionConfigChange,
  interview,
  interviewScreen,
  isAlwaysExecuteChecked,
}: Props): JSX.Element {
  const { actionConfig } = action;
  const screens = useInterviewScreens(interview.id);
  const onActionTypeChange = (
    newActionType: ConditionalAction.ActionType,
  ): void => {
    onActionConfigChange(
      ConditionalAction.createDefaultActionConfig(newActionType),
    );
  };

  const screenOptions = React.useMemo(
    () =>
      screens
        ? screens
            .filter(screen =>
              isAlwaysExecuteChecked ? screen.id !== interviewScreen.id : true,
            )
            .map(screen => ({
              value: screen.id,
              displayValue: Screen.getTitle(screen),
            }))
        : [],
    [screens, interviewScreen, isAlwaysExecuteChecked],
  );

  const renderEditor = (): JSX.Element | null => {
    switch (actionConfig.type) {
      case ConditionalAction.ActionType.END_INTERVIEW:
        return null;
      case ConditionalAction.ActionType.PUSH:
        // TODO: we only allow a single screen to be pushed for now. This needs
        // to be updated once we have a multi-select dropdown component.
        return (
          <LabelWrapper inline label="Next stage" labelTextClassName="w-20">
            <Dropdown
              onChange={newScreenId =>
                onActionConfigChange({
                  type: ConditionalAction.ActionType.PUSH,
                  payload: [newScreenId],
                })
              }
              placeholder="Select a stage"
              value={actionConfig.payload[0]}
              options={screenOptions}
            />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.SKIP:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.CHECKPOINT:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.MILESTONE:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.RESTORE:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      default:
        return assertUnreachable(actionConfig);
    }
  };

  // TODO: replace these with Form.Dropdown and other controls
  return (
    <>
      <LabelWrapper inline label="Action" labelTextClassName="w-20">
        <Dropdown
          onChange={onActionTypeChange}
          placeholder="Action type"
          value={actionConfig.type}
          options={ACTION_TYPE_OPTIONS}
        />
      </LabelWrapper>

      {renderEditor()}
    </>
  );
}
