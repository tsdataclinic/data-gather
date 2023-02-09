import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import * as React from 'react';
import * as Scroll from 'react-scroll';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import LabelWrapper from '../../ui/LabelWrapper';
import ActionConfigEditor from './ActionConfigEditor';
import Form from '../../ui/Form';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import type { EditableAction } from '../types';
import ConditionalOperatorRow from './ConditionalOperatorRow';
import Button from '../../ui/Button';

type Props = {
  action: EditableAction;
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onActionDelete: (actionToDelete: EditableAction) => void;

  /** Should we scroll to this card when it mounts? */
  scrollOnMount: boolean;
};

function ActionCard(
  {
    action,
    interview,
    onActionChange,
    onActionDelete,
    scrollOnMount,
    interviewScreen,
  }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  // TODO: when interview is a nested model we won't need these sub-queries
  const actionId = 'id' in action ? action.id : action.tempId;
  const interviewScreens = useInterviewScreens(interview.id);
  const allEntries = React.useMemo(
    () =>
      interviewScreens?.flatMap(screen =>
        screen.entries.map(entry => ({ ...entry, screen })),
      ) ?? [],
    [interviewScreens],
  );

  const onAlwaysExecuteChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const isChecked = event.target.checked;
      onActionChange(action, {
        ...action,
        conditionalOperator: isChecked
          ? ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE
          : ConditionalAction.ConditionalOperator.EQ,
      });
    },
    [action, onActionChange],
  );

  const onConditionalOperationChange = React.useCallback(
    (newAction: EditableAction) => {
      onActionChange(action, newAction);
    },
    [action, onActionChange],
  );

  const onActionConfigChange = React.useCallback(
    (newActionConfig: ConditionalAction.T['actionConfig']) => {
      onActionChange(action, {
        ...action,
        actionConfig: newActionConfig,
      });
    },
    [action, onActionChange],
  );

  const isAlwaysExecuteChecked =
    action.conditionalOperator ===
    ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE;

  // on mount, scroll to this component
  React.useEffect(() => {
    if (scrollOnMount) {
      Scroll.scroller.scrollTo(actionId, {
        containerId: 'scrollContainer',
        smooth: true,
      });
    }
  }, [actionId, scrollOnMount]);

  return (
    <ScrollableElement
      name={actionId}
      className="relative flex w-full flex-row rounded border border-gray-300 bg-gray-50 p-6 text-slate-800"
    >
      <Button
        unstyled
        className="absolute top-4 right-4"
        onClick={() => onActionDelete(action)}
      >
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
        />
      </Button>

      {
        // TODO: create a Form.Checkbox control
      }
      <Form ref={forwardedRef} className="col-span-3 space-y-4">
        <ActionConfigEditor
          action={action}
          onActionConfigChange={onActionConfigChange}
          interview={interview}
          interviewScreen={interviewScreen}
          isAlwaysExecuteChecked={isAlwaysExecuteChecked}
        />
        {!isAlwaysExecuteChecked && (
          <ConditionalOperatorRow
            action={action}
            allEntries={allEntries}
            onConditionalOperationChange={onConditionalOperationChange}
            defaultLanguage={interview.defaultLanguage}
          />
        )}
        <LabelWrapper inline labelAfter label="Always execute this action">
          <MixedCheckbox
            checked={isAlwaysExecuteChecked}
            onChange={onAlwaysExecuteChange}
          />
        </LabelWrapper>
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(ActionCard);
