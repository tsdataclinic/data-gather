import React from 'react';
import { Interview } from '../../types';
import './index.css';

interface Props {
  interview: Interview;
}

function ConfigureCard({ interview }: Props): JSX.Element {
  return <div className="card">Configure Card for {interview.name}</div>;
}

export default ConfigureCard;
