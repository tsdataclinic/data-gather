import {
  faGear,
  faLocationArrow,
  faPenToSquare,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import useInterviewStore from '../../../hooks/useInterviewStore';
import * as ConditionalAction from '../../../models/ConditionalAction';
import * as InterviewScreen from '../../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import {
  actionTypeToDisplayString,
  getActionById,
} from '../../../models/ConditionalAction';

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
  const interviewStore = useInterviewStore();
  const [screenEntries, setScreenEntries] = useState<
    InterviewScreenEntry.T[] | undefined
  >(undefined);
  const [screenActions, setScreenActions] = useState<
    ConditionalAction.T[] | undefined
  >(undefined);

  useEffect(() => {
    if (screen !== 'configure') {
      interviewStore.getScreenEntries(screen.entries).then(setScreenEntries);
      interviewStore
        .getConditionalActions(screen.actions)
        .then(setScreenActions);
    } else {
      setScreenEntries(undefined);
      setScreenActions(undefined);
    }
  }, [interviewStore, screen]);

  const screenMenuItemClass = classNames(
    'flex text-slate-600 flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full hover:text-blue-700 transition-colors duration-200',
    {
      'bg-blue-100': isSelected && selectedEntry === null,
    },
  );

  const entryMenuItemClass = (id: string): string =>
    classNames(
      'flex flex-row text-slate-600 gap-2.5 items-center py-2.5 pr-5 pl-20 w-full hover:text-blue-700 cursor-pointer transition-colors duration-200',
      { 'bg-blue-100': selectedEntry === id },
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
          {screen.actions.map(actionId => (
            <ScrollLink
              key={actionId}
              className={entryMenuItemClass('ACTION')}
              activeClass="active"
              to="ACTION"
              duration={250}
              containerId="scrollContainer"
              onClick={() => setSelectedEntry('ACTION')}
            >
              <FontAwesomeIcon size="1x" icon={faLocationArrow} />
              Action:{' '}
              {actionTypeToDisplayString(
                getActionById(actionId, screenActions)?.actionConfig.type,
              )}
            </ScrollLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
