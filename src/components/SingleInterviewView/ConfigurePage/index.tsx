import * as Interview from '../../../models/Interview';
import ConfigureCard from './ConfigureCard';
import OnSubmitCard from './OnSubmitCard';
import ScrollArea from '../../ui/ScrollArea';

type Props = {
  interview: Interview.WithScreensAndActions;
};

export default function ConfigurePage({ interview }: Props): JSX.Element {
  return (
    <ScrollArea className="w-full overflow-auto">
      <div className="space-y-8 p-14">
        <ConfigureCard interview={interview} />
        <OnSubmitCard interview={interview} />
      </div>
    </ScrollArea>
  );
}
