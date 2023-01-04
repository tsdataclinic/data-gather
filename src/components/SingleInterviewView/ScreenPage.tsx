import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import ActionCard, { type EditableAction } from './ActionCard';
import EntryCard, { type EditableEntry } from './EntryCard';
import useInterviewService from '../../hooks/useInterviewService';
import HeaderCard from './HeaderCard';
import ScreenToolbar from './ScreenToolbar';
import ScrollArea from '../ui/ScrollArea';
import useAppDispatch from '../../hooks/useAppDispatch';
import { useToast } from '../ui/Toast';

type Props = {
  defaultActions: readonly ConditionalAction.T[];
  defaultEntries: readonly InterviewScreenEntry.T[];
  defaultScreen: InterviewScreen.WithChildrenT;
  interview: Interview.T;
};

/**
 * The ScreenCard is an uncontrolled component because any changes to actions
 * are only tracked internally. These changes are not bubbled up to the rest
 * of the app until "Save" is clicked.
 */
export default function ScreenCard({
  defaultEntries,
  defaultActions,
  defaultScreen,
  interview,
}: Props): JSX.Element {
  const toaster = useToast();
  const interviewService = useInterviewService();
  const dispatch = useAppDispatch();

  // track the screen internally so we can modify it without persisting until
  // 'save' is clicked
  // TODO: eventually when the screen model is updated to a nested model on
  // the frontend, we only need to track `screen` instead of separate
  // arrays for actions and entries
  const [screen, setScreen] = React.useState(defaultScreen);

  // track actions internallly so we can modify them without persisting until
  // 'save' is clicked
  const [allActions, setAllActions] =
    React.useState<readonly EditableAction[]>(defaultActions);

  // track entries internally so we can modify them without persisting until
  // 'save' is clicked
  const [allEntries, setAllEntries] =
    React.useState<readonly EditableEntry[]>(defaultEntries);

  const allFormRefs = React.useRef(new Map<string, HTMLFormElement>());

  const onNewActionClick = (): void =>
    setAllActions(prevActions =>
      prevActions.concat(
        ConditionalAction.create({
          order: prevActions.length + 1,
          screenId: screen.id,
        }),
      ),
    );

  const onNewEntryClick = (): void => {
    setAllEntries(prevEntries =>
      prevEntries.concat(
        InterviewScreenEntry.create({
          name: `Entry ${prevEntries.length + 1}`,
          order: prevEntries.length + 1,
          prompt: '',
          text: '',
          screenId: screen.id,
          responseType: InterviewScreenEntry.ResponseType.TEXT,
          responseTypeOptions: {
            selectedBase: '',
            selectedTable: '',
            selectedFields: [],
          },
        }),
      ),
    );
  };

  const onActionChange = React.useCallback(
    (actionToReplace: EditableAction, newAction: EditableAction) => {
      setAllActions(prevActions =>
        prevActions.map(action =>
          action === actionToReplace ? newAction : action,
        ),
      );
    },
    [],
  );

  const onEntryChange = React.useCallback(
    (entryToReplace: EditableEntry, newEntry: EditableEntry) => {
      setAllEntries(prevEntries =>
        prevEntries.map(entry => (entry === entryToReplace ? newEntry : entry)),
      );
    },
    [],
  );

  const onEntryDelete = React.useCallback((entryToDelete: EditableEntry) => {
    setAllEntries(prevEntries =>
      prevEntries.filter(entry => entry !== entryToDelete),
    );
  }, []);

  const onScreenChange = React.useCallback(
    (newScreen: InterviewScreen.WithChildrenT) => {
      setScreen(newScreen);
    },
    [],
  );

  const onSaveClick = React.useCallback(async () => {
    const actionsForms = Array.from(allFormRefs.current.entries());
    const allFormsValid = actionsForms.every(([_, form]) => {
      // side-effect: also trigger the builtin browser validation UI
      form.reportValidity();
      return form.checkValidity();
    });

    if (allFormsValid) {
      const updatedScreen =
        await interviewService.interviewScreenAPI.updateInterviewScreen(
          screen.id,
          { ...screen, actions: allActions, entries: allEntries },
        );

      dispatch({
        screen: updatedScreen,
        type: 'SCREEN_UPDATE',
      });
      toaster.notifySuccess('Saved!', `Successfully saved ${screen.title}`);
    }
  }, [allActions, screen, interviewService, allEntries, dispatch, toaster]);

  function formRefSetter(formKey: string): React.RefCallback<HTMLFormElement> {
    return (formElt: HTMLFormElement) => {
      if (formElt) {
        allFormRefs.current.set(formKey, formElt);
      } else {
        allFormRefs.current.delete(formKey);
      }
    };
  }

  return (
    <>
      <ScreenToolbar
        screen={screen}
        onSaveClick={onSaveClick}
        onNewEntryClick={onNewEntryClick}
        onNewActionClick={onNewActionClick}
      />
      <ScrollArea id="scrollContainer" className="w-full overflow-auto">
        <div className="flex flex-col items-center gap-14 p-14">
          <HeaderCard
            ref={formRefSetter('header-card')}
            screen={screen}
            onScreenChange={onScreenChange}
          />
          {allEntries.map(entry => (
            <EntryCard
              key={'id' in entry ? entry.id : entry.tempId}
              ref={formRefSetter('id' in entry ? entry.id : entry.tempId)}
              entry={entry}
              onEntryChange={onEntryChange}
              onEntryDelete={onEntryDelete}
            />
          ))}
          {allActions.map(action => (
            <ActionCard
              key={'id' in action ? action.id : action.tempId}
              ref={formRefSetter('id' in action ? action.id : action.tempId)}
              action={action}
              onActionChange={onActionChange}
              interview={interview}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
