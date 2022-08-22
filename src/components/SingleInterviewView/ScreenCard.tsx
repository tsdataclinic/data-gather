import React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

interface Props {
  actions: ConditionalAction.T[];
  entries: InterviewScreenEntry.T[];
  screen: InterviewScreen.T;
}

function ScreenCard({ actions, entries, screen }: Props): JSX.Element {
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
