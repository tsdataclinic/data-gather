import React from 'react';
import { InterviewScreen } from '../../types';

interface Props {
  screen: InterviewScreen;
}

function ScreenCard({ screen }: Props): JSX.Element {
  return (
    <div className="flex flex-col gap-14 items-center w-full">
      <div className="w-full h-60 bg-white shadow-md">
        Header card for {screen.displayName}
      </div>
      {screen.entries.map(entry => (
        <div className="w-full h-60 bg-white shadow-md" key={entry.id}>
          Entry card for {entry.id} <br />
          {entry.prompt}
        </div>
      ))}
      <div className="w-full h-60 bg-white shadow-md">
        Action card for {screen.displayName}
      </div>
    </div>
  );
}

export default ScreenCard;
