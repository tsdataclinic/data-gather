import { useLocation, Link } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useDataClinicAuth from '../../auth/useDataClinicAuth';
import useIsAuthenticated from '../../auth/useIsAuthenticated';
import Button from '../ui/Button';
import LocalInterviewService from '../../services/InterviewService/LocalInterviewService';
import BackendInterviewService from '../../services/InterviewService/BackendInterviewService';

export default function Header(): JSX.Element {
  const { login, logout } = useDataClinicAuth();
  const [localInterviews, setLocalInterviews] = useState<any>([])
  const isAuthenticated = useIsAuthenticated();
  const { pathname } = useLocation();
  const localStore = new LocalInterviewService()
  const backendStore = new BackendInterviewService()
  const showAuthBanner = useMemo(
    () => !isAuthenticated && !pathname.includes('published'),
    [isAuthenticated, pathname],
  );
  const showUnauthedInterviewsBanner = useMemo(
    () => 
    {
      console.log(localInterviews)
      return isAuthenticated && localInterviews
    }, [isAuthenticated, localInterviews]
  )


  useEffect(() => {
    localStore.interviewAPI.getAllInterviews().then((interviews) => setLocalInterviews(interviews))
  }, [])


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
      {showAuthBanner ? (
        <header className="z-50 flex h-12 w-full items-center bg-red-400 py-2 px-8 text-white">
          <span className="text-xl font-bold tracking-wide">
            You aren&apos;t signed in!
          </span>
          <span className="pl-2 text-sm">
            Some features of this app may not work until you&apos;re signed in.
            Click the button in the top-right to sign in.
          </span>
        </header>
      ) : null}
      {showUnauthedInterviewsBanner ? (
        <header className="z-50 flex h-12 w-full items-center bg-red-400 py-2 px-8 text-white">
          <span className="text-xl font-bold tracking-wide">
            You have interviews in your local browser cache
          </span>
          <span className="pl-2 text-sm">
            Copy them?
          </span>
          <Button onClick={() => {
            console.log(localInterviews)
            localInterviews.forEach(element => {
              console.log(element)
              delete element["id"]
              delete element["createDate"]
              backendStore.interviewAPI.createInterview(element)
            });
          }}>
            unstyled
          </Button>
        </header>
      ) : null}
    </>
  );
}
