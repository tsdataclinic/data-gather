import * as React from 'react';
import * as R from 'remeda';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Reorder } from 'framer-motion';
import * as ConditionalAction from '../../models/ConditionalAction';
import Button from '../ui/Button';
import ActionCard from './ActionCard';
import useRefMap from '../../hooks/useRefMap';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import InfoIcon from '../ui/InfoIcon';
import type { EditableAction, EditableEntryWithScreen } from './types';

type Props = {
  actions: readonly EditableAction[];
  allInterviewEntries: readonly EditableEntryWithScreen[];
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onActionChange: (
    entryToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onActionDelete: (entryToDelete: EditableAction) => void;
  onActionsOrderChange: (newActions: readonly EditableAction[]) => void;
  onNewActionClick: () => void;
};

type ConditionalActionsSectionAPI = {
  getForms: () => HTMLFormElement[];
};

function BaseConditionalActionsSection(
  {
    actions,
    allInterviewEntries,
    interview,
    interviewScreen,
    onActionChange,
    onActionDelete,
    onNewActionClick,
    onActionsOrderChange,
  }: Props,
  forwardedRef: React.ForwardedRef<ConditionalActionsSectionAPI>,
): JSX.Element {
  const actionIds = React.useMemo(
    () => actions.map(entry => ConditionalAction.getId(entry)),
    [actions],
  );

  const formRefs = useRefMap<HTMLFormElement | null>(actionIds, null);

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      getForms: () =>
        R.pipe(
          [...formRefs.values()],
          R.map(formRef => formRef.current),
          R.compact,
        ),
    }),
    [formRefs],
  );

  if (actions.length === 0) {
    return (
      <div className="relative flex w-full flex-col items-center space-y-4 border border-gray-200 bg-white p-10 text-center shadow-lg">
        <p>
          This stage has no actions to run after the user answers your
          questions.
        </p>
        <Button intent="primary" onClick={onNewActionClick}>
          Add an action
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col items-center space-y-6 border border-gray-200 bg-white px-10 pt-6 pb-10 shadow-lg">
      <div className="flex items-center self-start">
        <FontAwesomeIcon
          className="h-6 w-6 pr-4"
          icon={IconType.faLocationArrow}
        />
        <h2 className="mr-2 text-xl tracking-wide">Actions</h2>
        <InfoIcon tooltip="These are the actions to take after a user finishes this stage" />
      </div>

      <Reorder.Group
        axis="y"
        className="w-full space-y-6"
        values={actions as EditableAction[]}
        onReorder={onActionsOrderChange}
      >
        {actions.map(action => {
          const actionId = ConditionalAction.getId(action);
          return (
            <Reorder.Item key={actionId} value={action}>
              <ActionCard
                key={actionId}
                allInterviewEntries={allInterviewEntries}
                ref={formRefs.get(actionId)}
                conditionalAction={action}
                onConditionalActionChange={onActionChange}
                onConditionalActionDelete={onActionDelete}
                scrollOnMount={ConditionalAction.isCreateType(action)}
                interview={interview}
                interviewScreen={interviewScreen}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}

const ConditionalActionsSection = React.forwardRef(
  BaseConditionalActionsSection,
);
export default ConditionalActionsSection;
