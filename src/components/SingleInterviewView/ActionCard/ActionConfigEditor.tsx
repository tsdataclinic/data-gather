import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
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

type Props = {
  actionConfig: ConditionalAction.ActionConfig;
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  isAlwaysExecuteChecked?: boolean;
  onActionConfigChange: (actionConfig: ConditionalAction.ActionConfig) => void;
};

/**
 * This component is used to configure a conditional action's payload.
 * It renders differently based off of what the action type is
 */
export default function ActionConfigEditor({
  actionConfig,
  onActionConfigChange,
  interview,
  interviewScreen,
  isAlwaysExecuteChecked = false,
}: Props): JSX.Element {
  const { id: interviewId, defaultLanguage } = interview;
  const screens = useInterviewScreens(interviewId);
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
              displayValue: InterviewScreen.getTitle(screen, defaultLanguage),
            }))
        : [],
    [screens, interviewScreen, isAlwaysExecuteChecked, defaultLanguage],
  );

  const renderConfigEditor = (): JSX.Element | null => {
    switch (actionConfig.type) {
      case ConditionalAction.ActionType.END_INTERVIEW:
        return null;
      case ConditionalAction.ActionType.PUSH:
        // NOTE: we only allow a single action to be pushed because 'PUSH' is
        // being used here as 'Go to next stage'
        return (
          <LabelWrapper inline label="Next stage" labelTextClassName="w-20">
            <Dropdown
              onChange={newScreenId =>
                onActionConfigChange({
                  id: actionConfig.id,
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
    <div className="space-y-2 rounded border border-gray-300 bg-gray-200 p-3">
      <LabelWrapper inline label="Action" labelTextClassName="w-20">
        <Dropdown
          onChange={onActionTypeChange}
          placeholder="Action type"
          value={actionConfig.type}
          options={ACTION_TYPE_OPTIONS}
        />
      </LabelWrapper>

      {renderConfigEditor()}
    </div>
  );
}
