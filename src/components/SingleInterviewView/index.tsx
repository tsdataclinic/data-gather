import { Route, Routes, useParams } from 'react-router-dom';
import useInterview from '../../hooks/useInterview';
import useInterviewConditionalActions from '../../hooks/useInterviewConditionalActions';
import useInterviewScreenEntries from '../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import ConfigureCard from './ConfigureCard';
import ScreenCard from './ScreenCard';
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
      <div
        className="flex h-full w-4/5 flex-col items-center space-y-4 overflow-scroll p-14"
        id="scrollContainer"
      >
        <Routes>
          <Route
            path="configure"
            element={<ConfigureCard interview={interview} />}
          />
          {screens?.map(screen => {
            const actionsList = actions?.get(screen.id) ?? [];

            // we track the load state of `actions` as a key so the ScreenCard can remount
            // when the actions array finishes loading
            const actionKey =
              actions === undefined ? 'loading_actions' : 'loaded_actions';
            const screenKey = `${screen.id}__${actionKey}`;

            return (
              <Route
                key={screen.id}
                path={`/screen/${screen.id}`}
                element={
                  <ScreenCard
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
