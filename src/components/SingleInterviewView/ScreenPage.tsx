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

type Props = {
  defaultActions: readonly ConditionalAction.T[];
  entries: readonly InterviewScreenEntry.T[];
  interview: Interview.T;
  screen: InterviewScreen.T;
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
  entries,
  defaultActions,
  screen,
  interview,
}: Props): JSX.Element {
  const screenId = screen.id;
  const interviewStore = useInterviewStore();
  const [isNewEntryModelOpen, setIsNewEntryModalOpen] =
    React.useState<boolean>(false);

  // track actions array here so we can modify them without persisting until
  // 'save' is hit
  const [allActions, setAllActions] = React.useState(defaultActions);
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

  const onSaveClick = React.useCallback(() => {
    const actionsForms = Array.from(allFormRefs.current.entries());
    const allActionFormsValid = actionsForms.every(([_, form]) => {
      // side-effect: also trigger the builtin browser validation UI
      form.reportValidity();
      return form.checkValidity();
    });

    if (allActionFormsValid) {
      interviewStore.updateScreenConditionalActions(screenId, allActions);
    }
  }, [allActions, screenId, interviewStore]);

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
          <HeaderCard screen={screen} />
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              ref={formElt => {
                if (formElt) {
                  allFormRefs.current.set(entry.id, formElt);
                }
              }}
              entry={entry}
            />
          ))}
          {allActions.map(action => (
            <ActionCard
              key={action.id}
              ref={formElt => {
                if (formElt) {
                  allFormRefs.current.set(action.id, formElt);
                }
              }}
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
