import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

export default function Header(): JSX.Element {
  return (
    <header className="flex items-center py-2 px-8 w-full text-white bg-slate-900">
      <div className="flex-1">
        <Link to="/">
          <span className="text-2xl font-bold">Interview</span>
          <div>by data clinic</div>
        </Link>
      </div>
      <div>
        <FontAwesomeIcon size="2x" icon={faUser} />
      </div>
    </header>
  );
}
