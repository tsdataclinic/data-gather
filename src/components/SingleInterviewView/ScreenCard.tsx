import * as React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Button from '../ui/Button';
import ActionCard from './ActionCard';
import EntryCard from './EntryCard';
import useInterviewStore from '../../hooks/useInterviewStore';

interface Props {
  actions: readonly ConditionalAction.T[];
  entries: readonly InterviewScreenEntry.T[];
  screen: InterviewScreen.T;
}

function ScreenCard({ entries, actions, screen }: Props): JSX.Element {
  const screenId = screen.id;
  const interviewStore = useInterviewStore();

  // clone the actions array here so we can modify them without persisting until
  // 'save' is hit
  const [allActions, setAllActions] = React.useState<
    readonly ConditionalAction.T[]
  >(() => [...actions]);

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
      <ScrollableElement
        name="HEADER"
        className="h-60 w-full bg-white shadow-md"
      >
        Header card for {screen.title}
      </ScrollableElement>
      {entries.map(entry => (
        <EntryCard entry={entry} key={entry.id} />
      ))}
      {allActions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onActionChange={onActionChange}
        />
      ))}
      <Button onClick={onSaveClick}>Save</Button>
    </div>
  );
}

export default ScreenCard;
