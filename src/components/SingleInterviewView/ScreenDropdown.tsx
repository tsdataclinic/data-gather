import {
  faGear,
  faLocationArrow,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useMatch } from 'react-router-dom';
import { Entry } from '../../types';

interface Props {
  entries: Entry[];
}

export default function ScreenDropdown({ entries }: Props): JSX.Element {
  const path = useMatch('/interview/:interviewId/*')?.pathnameBase;

  return (
    <div className="flex flex-col items-center p-0 w-full">
      {/* Configure */}
      <NavLink
        className="flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full"
        to={`${path}/configure`}
      >
        <FontAwesomeIcon size="1x" icon={faGear} />
        Header
      </NavLink>

      {entries.map(({ id }) => (
        <NavLink
          className="flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full"
          to={`${path}/configure`}
          key={id}
        >
          <FontAwesomeIcon size="1x" icon={faQuestion} />
          {id}
        </NavLink>
      ))}

      <NavLink
        className="flex flex-row gap-2.5 items-center py-2.5 pr-5 pl-20 w-full"
        to={`${path}/configure`}
      >
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        Action
      </NavLink>
    </div>
  );
}
