import React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import EntryCard from './EntryCard';

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
        <EntryCard entry={entry} key={entry.id} />
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
