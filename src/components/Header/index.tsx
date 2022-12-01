import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import useDataClinicAuth from '../../auth/useDataClinicAuth';
import useCurrentUser from '../../auth/useCurrentUser';
import Button from '../ui/Button';
import getAuthToken from '../../auth/getAuthToken';

export default function Header(): JSX.Element {
  const { login, logout } = useDataClinicAuth();
  const { isAuthenticated } = useCurrentUser();

  return (
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
      <Button
        onClick={async () => {
          const token = await getAuthToken();
          fetch('/auth', {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => response.json())
            .then(value => {
              console.log(value);
            });
        }}
      >
        test auth
      </Button>
    </header>
  );
}
