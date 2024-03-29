import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import * as React from 'react';
import * as Scroll from 'react-scroll';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { Reorder, useDragControls } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import IfBlock from './IfBlock';
import Form from '../../ui/Form';
import Button from '../../ui/Button';
import type { EditableAction, EditableEntryWithScreen } from '../types';

type Props = {
  allInterviewEntries: readonly EditableEntryWithScreen[];
  conditionalAction: EditableAction;
  interview: Interview.T;
  interviewScreen: InterviewScreen.T;
  onConditionalActionChange: (
    actionToReplace: EditableAction,
    newAction: EditableAction,
  ) => void;
  onConditionalActionDelete: (actionToDelete: EditableAction) => void;

  /** Should we scroll to this card when it mounts? */
  scrollOnMount: boolean;
};

function ActionCard(
  {
    conditionalAction,
    allInterviewEntries,
    interview,
    onConditionalActionChange,
    onConditionalActionDelete,
    scrollOnMount,
    interviewScreen,
  }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const dragControls = useDragControls();
  const { ifClause } = conditionalAction;
  const actionId = ConditionalAction.isCreateType(conditionalAction)
    ? conditionalAction.tempId
    : conditionalAction.id;

  const onIfClauseChange = React.useCallback(
    (newIfClause: ConditionalAction.IfClause) => {
      onConditionalActionChange(conditionalAction, {
        ...conditionalAction,
        ifClause: newIfClause,
      });
    },
    [conditionalAction, onConditionalActionChange],
  );

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
    <Reorder.Item
      value={conditionalAction}
      dragControls={dragControls}
      dragListener={false}
    >
      <ScrollableElement
        name={actionId}
        className="relative flex w-full flex-row rounded border border-gray-300 bg-gray-50 px-8 py-6 text-slate-800"
      >
        <span className="absolute top-2 left-2 flex">
          <FontAwesomeIcon
            size="1x"
            className="cursor-grab pr-2.5 text-slate-500 transition-transform hover:scale-125 hover:text-slate-600"
            icon={IconType.faGripVertical}
            onPointerDown={e => {
              dragControls.start(e);
              e.preventDefault();
            }}
          />
        </span>
        <Button
          unstyled
          className="absolute top-4 right-4"
          onClick={() => onConditionalActionDelete(conditionalAction)}
        >
          <FontAwesomeIcon
            aria-label="Delete"
            className="h-5 w-5 text-slate-400 transition-colors duration-200 hover:text-red-500"
            icon={IconType.faX}
          />
        </Button>
        <Form ref={forwardedRef} className="w-full pr-12">
          <IfBlock
            allInterviewEntries={allInterviewEntries}
            interview={interview}
            interviewScreen={interviewScreen}
            ifClause={ifClause}
            onIfClauseChange={onIfClauseChange}
          />
        </Form>
      </ScrollableElement>
    </Reorder.Item>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(ActionCard);
