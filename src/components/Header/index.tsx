import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

export default function Header(): JSX.Element {
  return (
    <header className="z-50 flex h-12 w-full items-center bg-slate-800 py-2 px-8 text-white">
      <div className="flex-1">
        <Link to="/">
          <span className="text-2xl font-bold tracking-wide">Interview</span>
          <span className="pl-2 text-xs">by Data Clinic</span>
        </Link>
      </div>
      <div>
        <FontAwesomeIcon size="lg" icon={faUser} />
      </div>
    </header>
  );
}
