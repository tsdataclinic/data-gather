import * as React from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import useInterview from '../../hooks/useInterview';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import ConfigurePage from './ConfigurePage';
import ScreenPage from './ScreenPage';
import Sidebar from './Sidebar';
import useAppState from '../../hooks/useAppState';
import SelectedLanguageContext from './SelectedLanguageContext';

export default function SingleInterviewView(): JSX.Element {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const screens = useInterviewScreens(interview?.id);
  const { selectedLanguageCode } = useAppState();

  const firstScreenId = React.useMemo(() => {
    if (screens && screens.length >= 1) {
      return screens[0].id;
    }
    return undefined;
  }, [screens]);

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  const languageCodeToUse = selectedLanguageCode ?? interview.defaultLanguage;

  return (
    <SelectedLanguageContext.Provider value={languageCodeToUse}>
      <div className="flex h-full w-full flex-1 items-center overflow-y-hidden p-0">
        <Sidebar interview={interview} screens={screens} />
        <div className="flex h-full w-4/5 flex-col items-center bg-gray-100">
          <Routes>
            <Route
              path="configure"
              element={<ConfigurePage defaultInterview={interview} />}
            />
            {screens?.map(screen => (
              <Route
                key={screen.id}
                path={`screen/${screen.id}`}
                element={
                  <ScreenPage
                    key={screen.id}
                    defaultScreen={screen}
                    defaultEntries={screen.entries}
                    defaultActions={screen.actions}
                    interview={interview}
                  />
                }
              />
            ))}
            <Route
              path=""
              element={
                firstScreenId ? (
                  <Navigate to={`screen/${firstScreenId}`} />
                ) : null
              }
            />
          </Routes>
        </div>
      </div>
    </SelectedLanguageContext.Provider>
  );
}
