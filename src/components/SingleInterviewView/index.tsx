import { Route, Routes, useParams } from 'react-router-dom';
import useAppState from '../../hooks/useAppState';
import useInterviewScreenEntries from '../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import ConfigureCard from './ConfigureCard';
import ScreenCard from './ScreenCard';
import Sidebar from './Sidebar';

export default function SingleInterviewView(): JSX.Element {
  const { allInterviews } = useAppState();
  const { interviewId } = useParams();
  const interview = allInterviews.find(iview => iview.id === interviewId);
  const screens = useInterviewScreens(interview?.id ?? '');
  const entries = useInterviewScreenEntries(interview?.id ?? '');

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  return (
    <div className="flex overflow-y-hidden flex-1 items-center p-0 w-full h-full">
      <Sidebar interview={interview} screens={screens} />
      <div
        className="flex overflow-scroll flex-col items-center p-14 w-4/5 h-full"
        id="scrollContainer"
      >
        <Routes>
          <Route
            path="configure"
            element={<ConfigureCard interview={interview} />}
          />
          {screens?.map(screen => (
            <Route
              key={screen.id}
              path={`/screen/${screen.id}`}
              element={
                <ScreenCard
                  screen={screen}
                  entries={entries?.get(screen.id) ?? []}
                />
              }
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}
