import React from 'react';
import * as InterviewScreen from '../../models/InterviewScreen';

interface Props {
  screen: InterviewScreen.T;
}

function HeaderCard({ screen }: Props): JSX.Element {
  return <div>{screen.title}</div>;
}

export default HeaderCard;
