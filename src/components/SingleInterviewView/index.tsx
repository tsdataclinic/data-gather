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
import './index.css';

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
    if (id === selectedTab) return 'selected-menu-item';
    return 'menu-item';
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav className="space-y-4 w-1/4 bg-white">
        <div className="p-4">
          {/* Interview Name */}
          <div className="py-3 pl-3 text-2xl">
            <h1 className="tracking-wide overflow-ellipses">
              <Link className="float-left static pr-10 btn-back" to="/">
                <FontAwesomeIcon
                  className="icon-back"
                  icon={faCircleChevronLeft}
                />
              </Link>
              {interview.name}
            </h1>
          </div>

          {/* Menu */}
          <ul className="space-y-4">
            {/* Configure */}
            <li className={menuItemClass('configure')}>
              <NavLink
                to={`${path}/configure`}
                onClick={() => setSelectedTab('configure')}
              >
                <FontAwesomeIcon className="pr-2" size="1x" icon={faGear} />
                Configure
              </NavLink>
            </li>

            {/* Screens */}
            {interview.screens.map(({ displayName, id }) => (
              <li className={menuItemClass(id)} key={id}>
                <NavLink
                  to={`${path}/page/${id}`}
                  onClick={() => setSelectedTab(id)}
                >
                  <FontAwesomeIcon
                    className="pr-2"
                    size="1x"
                    icon={faPenToSquare}
                  />
                  {displayName}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Screen Button */}
        <Link className="w-1/4 add-page-btn" to="/">
          {' '}
          +{' '}
        </Link>
      </nav>

      {/* Right Side */}
      <div className="float-right w-3/4">
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
