import React from 'react';
import { InterviewScreen } from '../../types';

interface Props {
  screen: InterviewScreen;
}

function ScreenCard({ screen }: Props): JSX.Element {
  return (
    <div className="w-full h-60 bg-white shadow-md">
      ScreenCard for {screen.displayName}
    </div>
  );
}

export default ScreenCard;
