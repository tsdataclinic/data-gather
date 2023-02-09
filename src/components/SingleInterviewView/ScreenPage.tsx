import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import HeaderCard from './HeaderCard';
import ScreenToolbar from './ScreenToolbar';
import ScrollArea from '../ui/ScrollArea';
import { useToast } from '../ui/Toast';
import type { EditableAction, EditableEntry } from './types';
import EntriesSection from './EntriesSection';
import ConditionalActionsSection from './ConditionalActionsSection';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../hooks/useInterviewMutation';

type Props = {
  defaultActions: readonly ConditionalAction.T[];
  defaultEntries: readonly InterviewScreenEntry.T[];
  defaultScreen: InterviewScreen.WithChildrenT;
  interview: Interview.T;
};

function saveInterviewScreen(
  screen: InterviewScreen.UpdateT,
  api: InterviewServiceAPI,
): Promise<InterviewScreen.WithChildrenT> {
  return api.interviewScreenAPI.updateInterviewScreen(screen.id, screen);
}

/**
 * The ScreenPage is an uncontrolled component because any changes to actions
 * are only tracked internally. These changes are not bubbled up to the rest
 * of the app until "Save" is clicked.
 */
export default function ScreenPage({
  defaultEntries,
  defaultActions,
  defaultScreen,
  interview,
}: Props): JSX.Element {
  const toaster = useToast();
  const { defaultLanguage } = interview;
  const updateScreen = useInterviewMutation({
    mutation: saveInterviewScreen,
    invalidateQueries: [
      Interview.QueryKeys.getInterview(interview.id),
      InterviewScreen.QueryKeys.getScreens(interview.id),
    ],
  });

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

  const headerFormRef = React.useRef<null | HTMLFormElement>(null);
  const entriesSectionRef = React.useRef<null | React.ComponentRef<
    typeof EntriesSection
  >>(null);
  const actionsSectionRef = React.useRef<null | React.ComponentRef<
    typeof ConditionalActionsSection
  >>(null);

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
          prompt: { [defaultLanguage]: '' },
          text: { [defaultLanguage]: '' },
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
      setScreen(newScreen);
    },
    [],
  );

  const onSaveClick = async (): Promise<void> => {
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
      updateScreen(
        {
          ...screen,
          actions: allActions,
          entries: allEntries,
        },
        {
          onSuccess: updatedScreen => {
            toaster.notifySuccess(
              'Saved!',
              `Successfully saved ${InterviewScreen.getTitle(
                updatedScreen,
                defaultLanguage,
              )}`,
            );
          },
        },
      );
    }
  };

  return (
    <>
      <ScreenToolbar
        interview={interview}
        screen={screen}
        onSaveClick={onSaveClick}
        onNewEntryClick={onNewEntryClick}
        onNewActionClick={onNewActionClick}
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
