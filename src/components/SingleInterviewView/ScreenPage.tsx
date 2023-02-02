import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import ActionCard from './ActionCard';
import EntryCard from './EntryCard';
import useInterviewService from '../../hooks/useInterviewService';
import HeaderCard from './HeaderCard';
import ScreenToolbar from './ScreenToolbar';
import ScrollArea from '../ui/ScrollArea';
import useAppDispatch from '../../hooks/useAppDispatch';
import { useToast } from '../ui/Toast';
import type { EditableAction, EditableEntry } from './types';
import Button from '../ui/Button';

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
          name: `Question ${prevEntries.length + 1}`,
          order: prevEntries.length + 1,
          prompt: { en: '' }, // TODO UI should support multiple language prompts rather than hardcoding english
          text: { en: '' }, // TODO UI should support multiple language prompts rather than hardcoding english
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

  const onActionDelete = React.useCallback((actionToDelete: EditableAction) => {
    setAllActions(prevActions =>
      prevActions.filter(action => action !== actionToDelete),
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
      toaster.notifySuccess('Saved!', `Successfully saved ${screen.title.en}`); // TODO multilanguage support rather than hardcoded en
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
          {allEntries.length === 0 ? (
            <div className="relative flex w-full flex-col items-center space-y-4 border border-gray-200 bg-white p-10 shadow-lg">
              <p>No questions have been added yet.</p>
              <Button intent="primary" onClick={onNewEntryClick}>
                Add your first question
              </Button>
            </div>
          ) : (
            allEntries.map(entry => (
              <EntryCard
                key={
                  InterviewScreenEntry.isCreateType(entry)
                    ? entry.tempId
                    : entry.id
                }
                ref={formRefSetter(
                  InterviewScreenEntry.isCreateType(entry)
                    ? entry.tempId
                    : entry.id,
                )}
                entry={entry}
                onEntryChange={onEntryChange}
                onEntryDelete={onEntryDelete}
                scrollOnMount={InterviewScreenEntry.isCreateType(entry)}
              />
            ))
          )}
          {allActions.length === 0 ? (
            <div className="relative flex w-full flex-col items-center space-y-4 border border-gray-200 bg-white p-10 text-center shadow-lg">
              <p>
                This stage has no actions to run after the user answers your
                questions.
              </p>
              <Button intent="primary" onClick={onNewActionClick}>
                Add an action
              </Button>
            </div>
          ) : (
            allActions.map(action => (
              <ActionCard
                key={
                  ConditionalAction.isCreateType(action)
                    ? action.tempId
                    : action.id
                }
                ref={formRefSetter(
                  ConditionalAction.isCreateType(action)
                    ? action.tempId
                    : action.id,
                )}
                action={action}
                interview={interview}
                onActionChange={onActionChange}
                onActionDelete={onActionDelete}
                scrollOnMount={ConditionalAction.isCreateType(action)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
