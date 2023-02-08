import * as React from 'react';
import * as R from 'remeda';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as ConditionalAction from '../../models/ConditionalAction';
import Button from '../ui/Button';
import ActionCard from './ActionCard';
import type { EditableAction } from './types';
import useRefMap from '../../hooks/useRefMap';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import InfoIcon from '../ui/InfoIcon';

type Props = {
  actions: readonly EditableAction[];
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onActionChange: (
    entryToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onActionDelete: (entryToDelete: EditableAction) => void;
  onNewActionClick: () => void;
};

type ConditionalActionsSectionAPI = {
  getForms: () => HTMLFormElement[];
};

function BaseConditionalActionsSection(
  {
    actions,
    interview,
    interviewScreen,
    onActionChange,
    onActionDelete,
    onNewActionClick,
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

      {actions.map(action => {
        const actionId = ConditionalAction.getId(action);
        return (
          <ActionCard
            key={actionId}
            ref={formRefs.get(actionId)}
            action={action}
            onActionChange={onActionChange}
            onActionDelete={onActionDelete}
            scrollOnMount={ConditionalAction.isCreateType(action)}
            interview={interview}
            interviewScreen={interviewScreen}
          />
        );
      })}
    </div>
  );
}

const ConditionalActionsSection = React.forwardRef(
  BaseConditionalActionsSection,
);
export default ConditionalActionsSection;
