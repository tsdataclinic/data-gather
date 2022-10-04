import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import ActionCard from './ActionCard';
import EntryCard from './EntryCard';
import useInterviewStore from '../../hooks/useInterviewStore';
import HeaderCard from './HeaderCard';
import ScreenToolbar from './ScreenToolbar';
import ScrollArea from '../ui/ScrollArea';
import NewEntryModal from './NewEntryModal';
import useAppDispatch from '../../hooks/useAppDispatch';

type Props = {
  defaultActions: readonly ConditionalAction.T[];
  defaultEntries: readonly InterviewScreenEntry.T[];
  defaultScreen: InterviewScreen.T;
  interview: Interview.T;
};

/**
 * The ScreenCard is an uncontrolled component because any changes to actions
 * are only tracked internally. These changes are not bubbled up to the rest
 * of the app until "Save" is clicked.
 *
 * TODO: currently this component is only tracking `actions` in an uncontrolled
 * manner. We need to apply the same treatment to the rest of the Screen object
 * (for the entries and the header configuration). Any prop with a `default`
 * prefix implies it is uncontrolled.
 */
function ScreenCard({
  defaultEntries,
  defaultActions,
  defaultScreen,
  interview,
}: Props): JSX.Element {
  const interviewStore = useInterviewStore();
  const dispatch = useAppDispatch();

  const [isNewEntryModelOpen, setIsNewEntryModalOpen] =
    React.useState<boolean>(false);

  // track the screen internally so we can modify it without persisting until
  // 'save' is clicked
  // TODO: eventually when the screen model is updated to a nested model on
  // the frontend, we only need to track `screen` instead of separate
  // arrays for actions and entries
  const [screen, setScreen] = React.useState(defaultScreen);

  // track actions internallly so we can modify them without persisting until
  // 'save' is clicked
  const [allActions, setAllActions] = React.useState(defaultActions);

  // track entries internally so we can modify them without persisting until
  // 'save' is clicked
  const [allEntries, setAllEntries] = React.useState(defaultEntries);

  const allFormRefs = React.useRef(new Map<string, HTMLFormElement>());

  const onNewActionClick = (): void =>
    setAllActions(prevActions =>
      prevActions.concat(
        ConditionalAction.create({
          screenId: screen.id,
        }),
      ),
    );

  const onActionChange = React.useCallback((newAction: ConditionalAction.T) => {
    setAllActions(prevActions =>
      prevActions.map(action =>
        action.id === newAction.id ? newAction : action,
      ),
    );
  }, []);

  const onEntryChange = React.useCallback(
    (newEntry: InterviewScreenEntry.T) => {
      setAllEntries(prevEntries =>
        prevEntries.map(entry => (entry.id === newEntry.id ? newEntry : entry)),
      );
    },
    [],
  );

  const onScreenChange = React.useCallback((newScreen: InterviewScreen.T) => {
    setScreen(newScreen);
  }, []);

  const onNewEntryClick = React.useCallback(() => {
    setIsNewEntryModalOpen(true);
  }, []);

  const onNewEntrySubmit = async (vals: Map<string, string>): Promise<void> => {
    const entry = InterviewScreenEntry.create({
      name: vals.get('name') ?? '',
      prompt: vals.get('prompt') ?? '',
      responseType: vals.get('responseType') ?? '',
      screenId: screen.id,
      text: vals.get('text') ?? '',
    });

    await interviewStore.addEntryToScreen(screen.id, entry);
    setIsNewEntryModalOpen(false);
  };

  const onSaveClick = React.useCallback(async () => {
    const actionsForms = Array.from(allFormRefs.current.entries());
    const allFormsValid = actionsForms.every(([_, form]) => {
      // side-effect: also trigger the builtin browser validation UI
      form.reportValidity();
      return form.checkValidity();
    });

    if (allFormsValid) {
      // TODO: we should just have a single updateScreen function that just
      // replaces the screen object and updates the screenEntries and conditionalActions
      // dbs by adding/removing whatever is necessary
      dispatch({
        screen,
        type: 'SCREEN_UPDATE',
      });

      await interviewStore.putScreen(screen);
      await interviewStore.updateScreenEntries(screen.id, allEntries);
      await interviewStore.updateScreenConditionalActions(
        screen.id,
        allActions,
      );
    }
  }, [allActions, screen, interviewStore, allEntries, dispatch]);

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
              key={entry.id}
              ref={formRefSetter(entry.id)}
              entry={entry}
              onEntryChange={onEntryChange}
            />
          ))}
          {allActions.map(action => (
            <ActionCard
              key={action.id}
              ref={formRefSetter(action.id)}
              action={action}
              onActionChange={onActionChange}
              interview={interview}
            />
          ))}
        </div>
      </ScrollArea>

      <NewEntryModal
        isOpen={isNewEntryModelOpen}
        onDismiss={() => setIsNewEntryModalOpen(false)}
        onSubmit={onNewEntrySubmit}
      />
    </>
  );
}

export default ScreenCard;
