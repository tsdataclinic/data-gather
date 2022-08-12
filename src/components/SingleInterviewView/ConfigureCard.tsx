import React from 'react';
import * as Interview from '../../models/Interview';

interface Props {
  interview: Interview.T;
}

function ConfigureCard({ interview }: Props): JSX.Element {
  return (
    <div className="w-full h-60 bg-white shadow-md">
      Configure Card for {interview.name}
    </div>
  );
}

export default ConfigureCard;
