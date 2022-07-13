import React from 'react';
import { Element } from 'react-scroll';
import { InterviewScreen } from '../../types';

interface Props {
  screen: InterviewScreen;
}

function ScreenCard({ screen }: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-14 items-center w-full">
      <Element name="HEADER" className="w-full h-60 bg-white shadow-md">
        Header card for {screen.displayName}
      </Element>
      {screen.entries.map(entry => (
        <Element
          name={entry.id}
          className="w-full h-60 bg-white shadow-md"
          key={entry.id}
        >
          Entry card for {entry.id} <br />
          {entry.prompt}
        </Element>
      ))}
      <Element name="ACTION" className="w-full h-60 bg-white shadow-md">
        Action card for {screen.displayName}
      </Element>
    </div>
  );
}

export default ScreenCard;
