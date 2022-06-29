import {
  faCircleChevronLeft,
  faGear,
  faPenToSquare,
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
import ScreenDropdown from './ScreenDropdown';

export default function SingleInterviewView(): JSX.Element {
  const [selectedTab, setSelectedTab] = useState<string>();
  const path = useMatch('/interview/:interviewId/*')?.pathnameBase;

  const { allInterviews } = useContext(AppContext);
  const { interviewId } = useParams();
  const interview = allInterviews.find(iview => iview.id === interviewId);

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  const menuItemClass = (id: string): string => {
    if (id === selectedTab)
      return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full bg-blue-100';
    return 'flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-14 w-full';
  };

  return (
    <div className="flex flex-row items-center p-0 h-full">
      {/* Sidebar */}
      <nav className="relative space-y-4 w-1/5 h-full bg-white">
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
              className={menuItemClass('configure')}
              to={`${path}/configure`}
              onClick={() => setSelectedTab('configure')}
            >
              <FontAwesomeIcon size="1x" icon={faGear} />
              Configure
            </NavLink>

            {/* Screens */}
            {interview.screens.map(({ displayName, entries, id }) => (
              <div className="w-full" key={id}>
                <NavLink
                  className={menuItemClass(id)}
                  to={`${path}/page/${id}`}
                  onClick={() => setSelectedTab(id)}
                >
                  <FontAwesomeIcon size="1x" icon={faPenToSquare} />
                  {displayName}
                </NavLink>
                {selectedTab === id && <ScreenDropdown entries={entries} />}
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
      <div className="flex flex-col gap-14 items-center p-14 w-4/5 h-full">
        <Routes>
          <Route
            path="/configure"
            element={<ConfigureCard interview={interview} />}
          />
          {interview.screens.map(screen => (
            <Route
              key={screen.id}
              path={`/page/${screen.id}`}
              element={<ScreenCard screen={screen} />}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}
