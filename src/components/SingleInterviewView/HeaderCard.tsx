import React from 'react';
import { InterviewScreen } from '../../types';

interface Props {
  screen: InterviewScreen;
}

function HeaderCard({ screen }: Props): JSX.Element {
  return <div>{screen.displayName}</div>;
}

export default HeaderCard;
