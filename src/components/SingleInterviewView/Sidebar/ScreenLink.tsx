import {
  faGear,
  faLocationArrow,
  faPenToSquare,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import * as InterviewScreen from '../../../models/InterviewScreen';

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
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const screenMenuItemClass = classNames(
    'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full hover:text-blue-700',
    {
      'bg-blue-100': isSelected && selectedEntry === null,
    },
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

  const entryMenuItemClass = (id: string): string => {
    if (selectedEntry === id) {
      return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full bg-blue-100 hover:text-blue-700';
    }
    return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full hover:text-blue-700';
  };

  return (
    <div className="w-full" key={screen.id}>
      <NavLink
        className={screenMenuItemClass}
        to={`${screenPath}/screen/${screen.id}`}
        onClick={() => {
          onScreenSelect(screen.id);
          setSelectedEntry(null);
        }}
      >
        <FontAwesomeIcon size="1x" icon={faPenToSquare} />
        {screen.title}
      </NavLink>

      {isSelected ? (
        <div className="flex flex-col items-center p-0 w-full">
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
              {entryId}
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
    </div>
  );
}
