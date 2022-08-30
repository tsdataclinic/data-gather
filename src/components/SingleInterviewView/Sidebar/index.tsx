import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAppDispatch from '../../../hooks/useAppDispatch';
import useInterviewStore from '../../../hooks/useInterviewStore';
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
  const interviewStore = useInterviewStore();
  const dispatch = useAppDispatch();
  const [selectedScreen, setSelectedScreen] = useState<string>();

  const onNewScreenSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      const screen = InterviewScreen.create({
        title: vals.get('name') ?? '',
      });

      await interviewStore.addScreenToInterview(interview.id, screen);

      dispatch({
        interviewId: interview.id,
        screen,
        type: 'SCREEN_ADD',
      });
      setIsNewScreenModalOpen(false);
    },
    [interviewStore, dispatch, interview],
  );

  return (
    <nav className="relative top-0 items-stretch w-96 h-full bg-white">
      <div className="flex flex-col items-start py-10 px-0">
        <div className="flex flex-row gap-2.5 items-center py-2.5 px-5 text-2xl">
          <NavLink className="w-7 h-7" to="/">
            <FontAwesomeIcon className="w-6 h-6" icon={faCircleChevronLeft} />
          </NavLink>
          {interview.name}
        </div>

        {/* Menu */}
        <div className="flex flex-col items-start w-full">
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
        className="absolute bottom-0 py-4 cursor-pointer"
        onClick={() => setIsNewScreenModalOpen(true)}
      >
        +
      </Button>

      <NewScreenModal
        isOpen={isNewScreenModalOpen}
        onDismiss={() => setIsNewScreenModalOpen(false)}
        onSubmit={onNewScreenSubmit}
      />
    </nav>
  );
}
