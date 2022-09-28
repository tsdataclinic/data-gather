import * as React from 'react';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Button from '../ui/Button';
import ActionCard from './ActionCard';
import EntryCard from './EntryCard';
import useInterviewStore from '../../hooks/useInterviewStore';
import HeaderCard from './HeaderCard';

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

  // track actions array here so we can modify them without persisting until
  // 'save' is hit
  const [allActions, setAllActions] = React.useState(defaultActions);

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

  const onSaveClick = React.useCallback(async () => {
    await interviewStore.updateScreenConditionalActions(screenId, allActions);
  }, [allActions, screenId, interviewStore]);

  return (
    <div className="flex w-full flex-col items-center gap-14">
      <div className="flex space-x-4 self-end">
        <Button>New Entry</Button>
        <Button onClick={onNewActionClick}>New Action</Button>
      </div>
      <HeaderCard screen={screen} />
      {entries.map(entry => (
        <EntryCard entry={entry} key={entry.id} />
      ))}
      {allActions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onActionChange={onActionChange}
          interview={interview}
        />
      ))}
      <Button onClick={onSaveClick}>Save</Button>
    </div>
  );
}

export default ScreenCard;
