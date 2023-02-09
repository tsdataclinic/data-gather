import {
  faTag,
  faLocationArrow,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useMatch } from 'react-router-dom';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

interface Props {
  entries: InterviewScreenEntry.T[];
}

export default function ScreenDropdown({ entries }: Props): JSX.Element {
  const path = useMatch(
    '/interview/:interviewId/screen/:screenID',
  )?.pathnameBase;

  return (
    <div className="flex w-full flex-col items-center p-0">
      {/* Configure */}
      <NavLink
        className="flex w-full flex-row items-center gap-2.5 py-2.5 pr-5 pl-20"
        to={`${path}`}
      >
        <FontAwesomeIcon size="1x" icon={faTag} />
        Header
      </NavLink>

      {entries.map(({ id }) => (
        <NavLink
          className="flex w-full flex-row items-center gap-2.5 py-2.5 pr-5 pl-20"
          to={`${path}`}
          key={id}
        >
          <FontAwesomeIcon size="1x" icon={faQuestion} />
          {id}
        </NavLink>
      ))}

      <NavLink
        className="flex w-full flex-row items-center gap-2.5 py-2.5 pr-5 pl-20"
        to={`${path}`}
      >
        <FontAwesomeIcon size="1x" icon={faLocationArrow} />
        Action
      </NavLink>
    </div>
  );
}
