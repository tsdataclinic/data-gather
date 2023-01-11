import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import LabelWrapper from '../../ui/LabelWrapper';
import ActionConfigEditor from './ActionConfigEditor';
import Form from '../../ui/Form';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import type { EditableAction } from '../types';
import ConditionalOperatorRow from './ConditionalOperatorRow';

type Props = {
  action: EditableAction;
  interview: Interview.T;
  onActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onActionDelete: (actionToDelete: EditableAction) => void;
};

function ActionCard(
  { action, interview, onActionChange, onActionDelete }: Props,
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

  const [isAlwaysExecuteChecked, setIsAlwaysExecuteChecked] = React.useState(
    action.conditionalOperator ===
      ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE,
  );

  const onAlwaysExecuteChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const isChecked = event.target.checked;
      setIsAlwaysExecuteChecked(isChecked);

      // if it is now unchecked and the conditionalOperator is ALWAYS_EXECUTE,
      // then we should change it to a reasonable default (such as EQUALS)
      if (
        !isChecked &&
        action.conditionalOperator ===
          ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE
      ) {
        onActionChange(action, {
          ...action,
          conditionalOperator: ConditionalAction.ConditionalOperator.EQ,
        });
      }
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

  return (
    <ScrollableElement
      name={actionId}
      className="relative grid w-full grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg"
    >
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        <span>Action</span>
      </div>
      <div className="absolute top-0 right-0 pr-4 pt-4">
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 cursor-pointer text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
          onClick={() => onActionDelete(action)}
        />
      </div>

      {
        // TODO: create a Form.Checkbox control
      }
      <Form ref={forwardedRef} className="col-span-3 space-y-4">
        <LabelWrapper inline labelAfter label="Always execute this action">
          <MixedCheckbox
            checked={isAlwaysExecuteChecked}
            onChange={onAlwaysExecuteChange}
          />
        </LabelWrapper>
        {!isAlwaysExecuteChecked && (
          <ConditionalOperatorRow
            action={action}
            allEntries={allEntries}
            onConditionalOperationChange={onConditionalOperationChange}
          />
        )}
        <ActionConfigEditor
          action={action}
          onActionConfigChange={onActionConfigChange}
          interview={interview}
        />
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(ActionCard);
