import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import * as Scroll from 'react-scroll';
import useInterviewService from '../../../hooks/useInterviewService';
import * as InterviewScreen from '../../../models/InterviewScreen';
import { actionTypeToDisplayString } from '../../../models/ConditionalAction';
import unsavedChangesConfirm from './unsavedChangesConfirm';

type Props = {
  isSelected: boolean;
  onScreenSelect: (screenId: string) => void;
  screen: InterviewScreen.T;
  unsavedChanges: boolean;
};

export default function ScreenLink({
  isSelected,
  onScreenSelect,
  screen,
  unsavedChanges,
}: Props): JSX.Element {
  const interviewPath = useMatch('/interview/:interviewId/*')?.pathnameBase;
  const [selectedEntry, setSelectedEntry] = useState<string | undefined>(
    undefined,
  );
  const interviewService = useInterviewService();
  const [fullScreen, setFullScreen] = useState<
    InterviewScreen.WithChildrenT | undefined
  >(undefined);

  useEffect(() => {
    // TODO: replace this with a useQuery hook instead
    async function fetchAndSetFullScreen(screenId: string): Promise<void> {
      const screenWithChildren =
        await interviewService.interviewScreenAPI.getInterviewScreen(screenId);
      setFullScreen(screenWithChildren);
    }

    fetchAndSetFullScreen(screen.id);
  }, [interviewService, screen]);

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

  return (
    <div className="w-full" key={screen.id}>
      <NavLink
        className={screenMenuItemClass}
        to={`${interviewPath}/screen/${screen.id}`}
        onClick={e => {
          const letsGo = unsavedChangesConfirm(unsavedChanges);
          if (!letsGo) {
            e.preventDefault();
          } else {
            onScreenSelect(screen.id);
            setSelectedEntry(undefined);
          }
        }}
      >
        <FontAwesomeIcon
          size="1x"
          className="pr-2.5"
          icon={IconType.faPenToSquare}
        />
        {/* TODO multilanguage support rather than hardcoding en */}
        {InterviewScreen.getTitle(screen)}
      </NavLink>

      {isSelected ? (
        <div className="flex w-full flex-col items-center p-0">
          {/* Header */}
          <Scroll.Link
            smooth
            className={entryMenuItemClass('HEADER')}
            activeClass="active"
            to="HEADER"
            duration={250}
            containerId="scrollContainer"
            onClick={() => setSelectedEntry('HEADER')}
          >
            <FontAwesomeIcon size="1x" icon={IconType.faGear} />
            Header
          </Scroll.Link>

          {/* Entries */}
          {fullScreen?.entries.map(entry => (
            <Scroll.Link
              className={entryMenuItemClass(entry.id)}
              smooth
              key={entry.id}
              activeClass="active"
              to={entry.id}
              duration={250}
              containerId="scrollContainer"
              onClick={() => setSelectedEntry(entry.id)}
            >
              <FontAwesomeIcon size="1x" icon={IconType.faQuestion} />
              {entry.name}
            </Scroll.Link>
          ))}

          {/* Action */}
          {fullScreen?.actions.map(action => (
            <Scroll.Link
              key={action.id}
              smooth
              className={entryMenuItemClass('ACTION')}
              activeClass="active"
              to="ACTION"
              duration={250}
              containerId="scrollContainer"
              onClick={() => setSelectedEntry('ACTION')}
            >
              <FontAwesomeIcon size="1x" icon={IconType.faLocationArrow} />
              Action: {actionTypeToDisplayString(action.actionConfig.type)}
            </Scroll.Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
