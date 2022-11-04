import * as React from 'react';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import Dropdown from '../../ui/Dropdown';
import LabelWrapper from '../../ui/LabelWrapper';
import assertUnreachable from '../../../util/assertUnreachable';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import InputText from '../../ui/InputText';
import MultiSelect from '../../ui/MultiSelect';

const ACTION_TYPE_OPTIONS = ConditionalAction.ACTION_TYPES.map(actionType => ({
  displayValue: ConditionalAction.actionTypeToDisplayString(actionType),
  value: actionType,
}));

type ActionConfig = ConditionalAction.T['actionConfig'];

type Props = {
  action: ConditionalAction.T;
  interview: Interview.T;
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
            .map(screen => ({
              value: screen.id,
              displayValue: screen.title,
            }))
            .concat({
              // Hardcoding an 'End option' for now just for demoing, but this
              // should be officially supported
              value: '__END_INTERVIEW__',
              displayValue: 'END INTERVIEW',
            })
        : [],
    [screens],
  );

  const renderEditor = (): JSX.Element | null => {
    switch (actionConfig.type) {
      case ConditionalAction.ActionType.Push:
        // TODO: we only allow a single screen to be pushed for now. This needs
        // to be updated once we have a multi-select dropdown component.
        return (
          <LabelWrapper
            inline
            label="Next stage"
            labelTextClassName="w-20"
            htmlFor={`${action.id}__push`}
          >
            <MultiSelect
              id={`${action.id}__push`}
              onChange={(newScreenIds: readonly string[]) =>
                onActionConfigChange({
                  type: ConditionalAction.ActionType.Push,
                  payload: newScreenIds,
                })
              }
              placeholder="Add stage"
              selectedValues={actionConfig.payload}
              options={screenOptions}
            />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.Skip:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.Checkpoint:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.Milestone:
        return (
          <LabelWrapper inline label="Payload" labelTextClassName="w-20">
            <InputText required onChange={() => {}} />
          </LabelWrapper>
        );
      case ConditionalAction.ActionType.Restore:
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
