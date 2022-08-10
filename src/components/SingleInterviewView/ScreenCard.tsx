import React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import { InterviewScreen } from '../../types';

interface Props {
  screen: InterviewScreen;
}

function ScreenCard({ screen }: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-14 items-center w-full">
      <ScrollableElement
        name="HEADER"
        className="w-full h-60 bg-white shadow-md"
      >
        Header card for {screen.displayName}
      </ScrollableElement>
      {screen.entries.map(entry => (
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
        Action card for {screen.displayName}
      </ScrollableElement>
    </div>
  );
}

export default ScreenCard;
