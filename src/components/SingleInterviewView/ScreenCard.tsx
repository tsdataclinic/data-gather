import React from 'react';
import { InterviewScreen } from '../../types';
import './index.css';

interface Props {
  screen: InterviewScreen;
}

function ScreenCard({ screen }: Props): JSX.Element {
  return <div className="card">ScreenCard for {screen.displayName}</div>;
}

export default ScreenCard;
