import React from 'react';
import { Interview } from '../../types';

interface Props {
  interview: Interview;
}

function ConfigureCard({ interview }: Props): JSX.Element {
  return (
    <div className="w-full h-60 bg-white shadow-md">
      Configure Card for {interview.name}
    </div>
  );
}

export default ConfigureCard;
