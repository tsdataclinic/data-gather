import React, { useCallback } from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Button from '../ui/Button';

interface Props {
  actions: ConditionalAction.T[];
  entries: InterviewScreenEntry.T[];
  screen: InterviewScreen.T;
}

function ScreenCard({ actions, entries, screen }: Props): JSX.Element {
  const interviewStore = useInterviewStore();
  const addNewEntry = useCallback(async (): Promise<void> => {
    const entry = InterviewScreenEntry.create({
      prompt: 'Dummy Prompt',
      screenId: screen.id,
    });
    await interviewStore.addEntryToScreen(screen.id, entry);
  }, [interviewStore, screen]);
  return (
    <div className="flex flex-col gap-14 items-center w-full">
      <ScrollableElement
        name="HEADER"
        className="w-full h-60 bg-white shadow-md"
      >
        Header card for {screen.title}
      </ScrollableElement>
      {entries.map(entry => (
        <ScrollableElement
          name={entry.id}
          className="w-full h-60 bg-white shadow-md"
          key={entry.id}
        >
          Entry card for {entry.id} <br />
          {entry.prompt}
        </ScrollableElement>
      ))}
      <Button onClick={addNewEntry}>Hi</Button>
      {actions.map(action => (
        <ScrollableElement
          key={action.id}
          name="ACTION"
          className="w-full h-60 bg-white shadow-md"
        >
          Action card with id {action.id}
        </ScrollableElement>
      ))}
    </div>
  );
}

export default ScreenCard;
