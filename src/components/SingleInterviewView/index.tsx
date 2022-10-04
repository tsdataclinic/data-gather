import { Route, Routes, useParams } from 'react-router-dom';
import useInterview from '../../hooks/useInterview';
import useInterviewConditionalActions from '../../hooks/useInterviewConditionalActions';
import useInterviewScreenEntries from '../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import ConfigurePage from './ConfigurePage';
import ScreenPage from './ScreenPage';
import Sidebar from './Sidebar';

export default function SingleInterviewView(): JSX.Element {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const screens = useInterviewScreens(interview?.id);
  const entries = useInterviewScreenEntries(interview?.id);
  const actions = useInterviewConditionalActions(interview?.id);

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  return (
    <div className="flex h-full w-full flex-1 items-center overflow-y-hidden p-0">
      <Sidebar interview={interview} screens={screens} />
      <div className="flex h-full w-4/5 flex-col items-center bg-gray-100">
        <Routes>
          <Route
            path="configure"
            element={<ConfigurePage interview={interview} />}
          />
          {screens?.map(screen => {
            // we track the length of the `actions` array as a key as a cheap
            // way to remount the page when actions finish loading. If this
            // causes performance issues (due to actions array changing length
            // whenever we hit save, causing a remount) then we should address
            // this.
            const actionsList = actions?.get(screen.id) ?? [];
            const screenKey = `${screen.id}__${actionsList.length}`;
            return (
              <Route
                key={screen.id}
                path={`/screen/${screen.id}`}
                element={
                  <ScreenPage
                    key={screenKey}
                    screen={screen}
                    entries={entries?.get(screen.id) ?? []}
                    defaultActions={actionsList}
                    interview={interview}
                  />
                }
              />
            );
          })}
        </Routes>
      </div>
    </div>
  );
}
