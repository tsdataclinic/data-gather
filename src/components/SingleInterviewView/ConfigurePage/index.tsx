import * as Interview from '../../../models/Interview';
import ConfigureCard from './ConfigureCard';
import OnSubmitCard from './OnSubmitCard';

type Props = {
  interview: Interview.WithScreensT;
};

export default function ConfigurePage({ interview }: Props): JSX.Element {
  return (
    <div className="w-full space-y-8 p-14">
      <ConfigureCard interview={interview} />
      <OnSubmitCard interview={interview} />
    </div>
  );
}
