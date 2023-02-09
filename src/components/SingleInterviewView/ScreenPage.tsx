import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import useInterviewService from '../../hooks/useInterviewService';
import HeaderCard from './HeaderCard';
import ScreenToolbar from './ScreenToolbar';
import ScrollArea from '../ui/ScrollArea';
import useAppDispatch from '../../hooks/useAppDispatch';
import { useToast } from '../ui/Toast';
import type { EditableAction, EditableEntry } from './types';
import EntriesSection from './EntriesSection';
import ConditionalActionsSection from './ConditionalActionsSection';

type Props = {
  defaultActions: readonly ConditionalAction.T[];
  defaultEntries: readonly InterviewScreenEntry.T[];
  defaultScreen: InterviewScreen.WithChildrenT;
  interview: Interview.T;
  setUnsavedChanges: any;
  unsavedChanges: boolean;
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
  setUnsavedChanges,
  unsavedChanges,
}: Props): JSX.Element {
  const toaster = useToast();
  const interviewService = useInterviewService();
  const dispatch = useAppDispatch();
  // Boolean indicating if there are unsaved changes
  const [unsavedActions, setUnsavedActions] = React.useState(false);
  const [unsavedEntries, setUnsavedEntries] = React.useState(false);

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

  const arrEqual = (arr1: readonly any[], arr2: readonly any[]): boolean => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((val, index) => val === arr2[index]);
  };

  const allFormRefs = React.useRef(new Map<string, HTMLFormElement>());
  const headerFormRef = React.useRef<null | HTMLFormElement>(null);
  const entriesSectionRef = React.useRef<null | React.ComponentRef<
    typeof EntriesSection
  >>(null);
  const actionsSectionRef = React.useRef<null | React.ComponentRef<
    typeof ConditionalActionsSection
  >>(null);

  // Any time actions or entries are changed compare to default
  React.useEffect(() => {
    setUnsavedActions(!arrEqual(defaultActions, allActions));
  }, [defaultActions, allActions, setUnsavedActions]);

  React.useEffect(() => {
    setUnsavedEntries(!arrEqual(defaultEntries, allEntries));
  }, [defaultEntries, allEntries, setUnsavedEntries]);

  React.useEffect(() => {
    setUnsavedChanges(unsavedActions || unsavedEntries);
  }, [unsavedActions, unsavedEntries, setUnsavedChanges]);

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
      setUnsavedChanges(true);
      setScreen(newScreen);
    },
    [setUnsavedChanges],
  );

  const onSaveClick = React.useCallback(async () => {
    const entriesForms = entriesSectionRef.current?.getForms() ?? [];
    const actionsForms = actionsSectionRef.current?.getForms() ?? [];
    const headerForm = headerFormRef.current;
    const allForms = (headerForm ? [headerForm] : []).concat(
      entriesForms,
      actionsForms,
    );

    const allFormsValid = allForms.every(form => {
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
      toaster.notifySuccess(
        'Saved!',
        `Successfully saved ${InterviewScreen.getTitle(screen)}`,
      );
    }
    setUnsavedChanges(false);
  }, [
    allActions,
    screen,
    interviewService,
    allEntries,
    dispatch,
    toaster,
    setUnsavedChanges,
  ]);

  return (
    <>
      <ScreenToolbar
        screen={screen}
        onSaveClick={onSaveClick}
        onNewEntryClick={onNewEntryClick}
        onNewActionClick={onNewActionClick}
        unsavedChanges={unsavedChanges}
      />
      <ScrollArea id="scrollContainer" className="w-full overflow-auto">
        <div className="flex flex-col items-center gap-10 px-14 py-10">
          <HeaderCard
            ref={headerFormRef}
            screen={screen}
            onScreenChange={onScreenChange}
          />
          <EntriesSection
            ref={entriesSectionRef}
            entries={allEntries}
            onEntryChange={onEntryChange}
            onEntryDelete={onEntryDelete}
            onNewEntryClick={onNewEntryClick}
          />
          <ConditionalActionsSection
            ref={actionsSectionRef}
            actions={allActions}
            onActionChange={onActionChange}
            onActionDelete={onActionDelete}
            onNewActionClick={onNewActionClick}
            interview={interview}
            interviewScreen={screen}
          />
        </div>
      </ScrollArea>
    </>
  );
}
