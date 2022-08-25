import { useMemo, useState, useCallback } from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Button from '../ui/Button';
import ActionCard from './ActionCard';

interface Props {
  actions: readonly ConditionalAction.T[];
  entries: readonly InterviewScreenEntry.T[];
  screen: InterviewScreen.T;
}

function ScreenCard({ actions, entries, screen }: Props): JSX.Element {
  const [modifiedActions, setModifiedActions] = useState<ConditionalAction.T[]>(
    [],
  );

  const onNewActionClick = (): void =>
    setModifiedActions(prevActions =>
      prevActions.concat(
        ConditionalAction.create({
          screenId: screen.id,
        }),
      ),
    );

  const onActionChange = useCallback(
    (newAction: ConditionalAction.T): void =>
      setModifiedActions(prevActions =>
        prevActions.map(action =>
          action.id === newAction.id ? newAction : action,
        ),
      ),
    [],
  );

  const allActions = useMemo(
    () => actions.concat(modifiedActions),
    [actions, modifiedActions],
  );

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
        <ScrollableElement
          name={entry.id}
          className="h-60 w-full bg-white shadow-md"
          key={entry.id}
        >
          Entry card for {entry.id} <br />
          {entry.prompt}
        </ScrollableElement>
      ))}
      {allActions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onActionChange={onActionChange}
        />
      ))}
    </div>
  );
}

export default ScreenCard;
