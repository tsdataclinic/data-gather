import {
  faCircleChevronLeft,
  faGear,
  faLocationArrow,
  faPenToSquare,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useMatch,
  useParams,
} from 'react-router-dom';
import AppContext from '../AppContext';
import ConfigureCard from './ConfigureCard';
import ScreenCard from './ScreenCard';

export default function SingleInterviewView(): JSX.Element {
  const [selectedScreen, setSelectedScreen] = useState<string>();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const screenPath = useMatch('/interview/:interviewId/*')?.pathnameBase;
  const entryPath = useMatch(
    '/interview/:interviewId/screen/:screenID',
  )?.pathnameBase;

  const { allInterviews } = useContext(AppContext);
  const { interviewId } = useParams();
  const interview = allInterviews.find(iview => iview.id === interviewId);

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  const screenMenuItemClass = (id: string): string => {
    if (selectedScreen === id && selectedEntry === null)
      return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full bg-blue-100';
    return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full';
  };

  const entryMenuItemClass = (id: string): string => {
    if (selectedEntry === id)
      return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full bg-blue-100';
    return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full';
  };

  return (
    <div className="flex overflow-y-hidden flex-1 items-center p-0 w-full h-full">
      {/* Sidebar */}
      <nav className="relative top-0 items-stretch w-1/5 h-full bg-white">
        <div className="flex flex-col items-start py-10 px-0">
          <div className="flex flex-row gap-2.5 items-center py-2.5 px-5 text-2xl">
            <Link className="w-7 h-7" to="/">
              <FontAwesomeIcon className="w-6 h-6" icon={faCircleChevronLeft} />
            </Link>
            {interview.name}
          </div>

          {/* Menu */}
          <div className="flex flex-col items-start w-full">
            {/* Configure */}
            <NavLink
              className={screenMenuItemClass('configure')}
              to={`${screenPath}/configure`}
              onClick={() => setSelectedScreen('configure')}
            >
              <FontAwesomeIcon size="1x" icon={faGear} />
              Configure
            </NavLink>

            {/* Screens */}
            {interview.screens.map(({ displayName, entries, id }) => (
              <div className="w-full" key={id}>
                {/* Screen name */}
                <NavLink
                  className={screenMenuItemClass(id)}
                  to={`${screenPath}/screen/${id}`}
                  onClick={() => {
                    setSelectedScreen(id);
                    setSelectedEntry(null);
                  }}
                >
                  <FontAwesomeIcon size="1x" icon={faPenToSquare} />
                  {displayName}
                </NavLink>

                {/* Header */}
                {selectedScreen === id && (
                  <div className="flex flex-col items-center p-0 w-full">
                    <NavLink
                      className={entryMenuItemClass('HEADER')}
                      to={`${entryPath}`}
                      onClick={() => setSelectedScreen('HEADER')}
                    >
                      <FontAwesomeIcon size="1x" icon={faGear} />
                      Header
                    </NavLink>

                    {/* Prompts */}
                    {entries.map(entry => (
                      <NavLink
                        className={entryMenuItemClass(entry.id)}
                        to={`${entryPath}`}
                        key={entry.id}
                        onClick={() => setSelectedScreen('entry.id')}
                      >
                        <FontAwesomeIcon size="1x" icon={faQuestion} />
                        {entry.id}
                      </NavLink>
                    ))}

                    {/* Action */}
                    <NavLink
                      className={entryMenuItemClass('ACTION')}
                      to={`${entryPath}`}
                      onClick={() => setSelectedScreen('ACTION')}
                    >
                      <FontAwesomeIcon size="1x" icon={faLocationArrow} />
                      Action
                    </NavLink>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Screen Button */}
        <Link
          className="flex absolute bottom-0 flex-row justify-center items-center w-full h-20 text-3xl bg-blue-100"
          to="/"
        >
          +
        </Link>
      </nav>

      {/* Right Side */}
      <div className="flex overflow-scroll flex-col items-center p-14 w-4/5 h-full">
        <Routes>
          <Route
            path="/configure"
            element={<ConfigureCard interview={interview} />}
          />
          {interview.screens.map(screen => (
            <Route
              key={screen.id}
              path={`/screen/${screen.id}`}
              element={<ScreenCard screen={screen} />}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}
