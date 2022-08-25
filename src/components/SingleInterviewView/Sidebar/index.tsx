import { faCircleChevronLeft, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import Button from '../../ui/Button';
import NewScreenModal from './NewScreenModal';
import ScreenLink from './ScreenLink';

type Props = {
  interview: Interview.T;
  screens: InterviewScreen.T[] | undefined;
};

export default function Sidebar({
  interview,
  screens = [],
}: Props): JSX.Element {
  const [isNewScreenModalOpen, setIsNewScreenModalOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string>();

  return (
    <nav className="relative top-0 h-full w-1/5 items-stretch bg-white">
      <div className="flex flex-col items-start py-10 px-0">
        <div className="flex flex-row items-center gap-2.5 py-2.5 px-5 text-2xl">
          <NavLink className="h-7 w-7" to="/">
            <FontAwesomeIcon className="h-6 w-6" icon={faCircleChevronLeft} />
          </NavLink>
          {interview.name}
        </div>

        {/* Menu */}
        <div className="flex w-full flex-col items-start">
          <NavLink
            to={Interview.getRunUrl(interview)}
            className="flex flex-row items-center gap-2.5 py-2.5 pl-14 text-blue-700"
          >
            <FontAwesomeIcon size="1x" icon={faPlay} /> Run
          </NavLink>

          {/* Configure */}
          <ScreenLink
            screen="configure"
            onScreenSelect={setSelectedScreen}
            isSelected={selectedScreen === 'configure'}
          />

          {/* Screens */}
          {screens.map(screen => (
            <ScreenLink
              key={screen.id}
              screen={screen}
              onScreenSelect={setSelectedScreen}
              isSelected={selectedScreen === screen.id}
            />
          ))}
        </div>
      </div>

      <Button
        variant="full"
        className="absolute bottom-0 py-4"
        onClick={() => setIsNewScreenModalOpen(true)}
      >
        +
      </Button>

      <NewScreenModal
        interview={interview}
        isOpen={isNewScreenModalOpen}
        onDismiss={() => setIsNewScreenModalOpen(false)}
      />
    </nav>
  );
}