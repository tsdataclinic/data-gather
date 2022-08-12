import React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

interface Props {
  entries: InterviewScreenEntry.T[];
  screen: InterviewScreen.T;
}

function ScreenCard({ entries, screen }: Props): JSX.Element {
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
      <ScrollableElement
        name="ACTION"
        className="w-full h-60 bg-white shadow-md"
      >
        Action card for {screen.title}
      </ScrollableElement>
    </div>
  );
}

export default ScreenCard;
