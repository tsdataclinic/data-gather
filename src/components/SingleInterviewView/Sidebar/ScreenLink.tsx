import {
  faGear,
  faLocationArrow,
  faPenToSquare,
  faPlus,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState, useCallback, useEffect } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import useInterviewStore from '../../../hooks/useInterviewStore';
import * as InterviewScreen from '../../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import NewEntryModal from './NewEntryModal';

type Props = {
  isSelected: boolean;
  onScreenSelect: (screenId: string) => void;
  screen: InterviewScreen.T | 'configure';
};

export default function ScreenLink({
  isSelected,
  onScreenSelect,
  screen,
}: Props): JSX.Element {
  const screenPath = useMatch('/interview/:interviewId/*')?.pathnameBase;
  const [selectedEntry, setSelectedEntry] = useState<string | undefined>(
    undefined,
  );
  const [isNewEntryModelOpen, setIsNewEntryModalOpen] =
    useState<boolean>(false);
  const interviewStore = useInterviewStore();
  const [screenEntries, setScreenEntries] = useState<
    InterviewScreenEntry.T[] | undefined
  >(undefined);

  useEffect(() => {
    if (screen !== 'configure') {
      interviewStore.getScreenEntries(screen.entries).then(setScreenEntries);
    } else {
      setScreenEntries(undefined);
    }
  }, [interviewStore, screen]);

  const screenMenuItemClass = classNames(
    'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full hover:text-blue-700',
    {
      'bg-blue-100': isSelected && selectedEntry === null,
    },
  );

  const entryMenuItemClass = (id: string): string =>
    classNames(
      'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full hover:text-blue-700 cursor-pointer',
      { 'bg-blue-100': selectedEntry === id },
    );

  const onNewEntrySubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      if (screen === 'configure') {
        setIsNewEntryModalOpen(false);
        return;
      }

      const entry = InterviewScreenEntry.create({
        name: vals.get('name') ?? '',
        prompt: vals.get('prompt') ?? '',
        responseType: vals.get('responseType') ?? '',
        screenId: screen.id,
        text: vals.get('text') ?? '',
      });

      await interviewStore.addEntryToScreen(screen.id, entry);

      setIsNewEntryModalOpen(false);
    },
    [interviewStore, screen],
  );

  if (screen === 'configure') {
    return (
      <NavLink
        className={screenMenuItemClass}
        to={`${screenPath}/configure`}
        onClick={() => onScreenSelect('configure')}
      >
        <FontAwesomeIcon size="1x" icon={faGear} />
        Configure
      </NavLink>
    );
  }

  return (
    <div className="w-full" key={screen.id}>
      <NavLink
        className={screenMenuItemClass}
        to={`${screenPath}/screen/${screen.id}`}
        onClick={() => {
          onScreenSelect(screen.id);
          setSelectedEntry(undefined);
        }}
      >
        <FontAwesomeIcon size="1x" icon={faPenToSquare} />
        {screen.title}
        {isSelected && (
          <FontAwesomeIcon
            className="order-2 ml-auto h-3 w-3"
            icon={faPlus}
            onClick={() => setIsNewEntryModalOpen(true)}
          />
        )}
      </NavLink>

      {isSelected ? (
        <div className="flex w-full flex-col items-center p-0">
          {/* Header */}
          <ScrollLink
            className={entryMenuItemClass('HEADER')}
            activeClass="active"
            to="HEADER"
            duration={250}
            containerId="scrollContainer"
            onClick={() => setSelectedEntry('HEADER')}
          >
            <FontAwesomeIcon size="1x" icon={faGear} />
            Header
          </ScrollLink>

          {/* Entries */}
          {screen.entries.map(entryId => (
            <ScrollLink
              className={entryMenuItemClass(entryId)}
              key={entryId}
              activeClass="active"
              to={entryId}
              duration={250}
              containerId="scrollContainer"
              onClick={() => setSelectedEntry(entryId)}
            >
              <FontAwesomeIcon size="1x" icon={faQuestion} />
              {InterviewScreenEntry.getEntryById(entryId, screenEntries)?.name}
            </ScrollLink>
          ))}

          {/* Action */}
          <ScrollLink
            className={entryMenuItemClass('ACTION')}
            activeClass="active"
            to="ACTION"
            duration={250}
            containerId="scrollContainer"
            onClick={() => setSelectedEntry('ACTION')}
          >
            <FontAwesomeIcon size="1x" icon={faLocationArrow} />
            Action
          </ScrollLink>
        </div>
      ) : null}

      <NewEntryModal
        isOpen={isNewEntryModelOpen}
        onDismiss={() => setIsNewEntryModalOpen(false)}
        onSubmit={onNewEntrySubmit}
      />
    </div>
  );
}
