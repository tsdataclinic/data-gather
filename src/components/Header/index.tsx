import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import useDataClinicAuth from '../../auth/useDataClinicAuth';
import useIsAuthenticated from '../../auth/useIsAuthenticated';
import Button from '../ui/Button';

export default function Header(): JSX.Element {
  const { login, logout } = useDataClinicAuth();
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <header className="z-50 flex h-12 w-full items-center bg-slate-800 py-2 px-8 text-white">
        <div className="flex-1">
          <Link to="/">
            <span className="text-2xl font-bold tracking-wide">Interview</span>
            <span className="pl-2 text-xs">by Data Clinic</span>
          </Link>
        </div>
        <Button
          unstyled
          onClick={async () => {
            if (isAuthenticated) {
              await logout();
            } else {
              await login();
            }
          }}
        >
          {isAuthenticated ? 'Sign out' : 'Sign in'}
          <FontAwesomeIcon className="ml-2" size="lg" icon={faUser} />
        </Button>
      </header>
      {!isAuthenticated && (
        <header className="z-50 flex h-12 w-full items-center bg-red-400 py-2 px-8 text-white">
          <span className="text-xl font-bold tracking-wide">
            You aren&apos;t signed in!
          </span>
          <span className="pl-2 text-sm">
            Some features of Interview may not work until you&apos;re signed in.
            Click the button in the top-right to sign in.
          </span>
        </header>
      )}
    </>
  );
}
