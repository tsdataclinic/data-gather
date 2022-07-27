import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import AllInterviewsView from './components/AllInterviewsView';
import Header from './components/Header';
import SingleInterviewView from './components/SingleInterviewView';
import ApiDemo from './components/apiDemo';
import InterviewStore from './store/InterviewStore';
import { AppState, AppDispatch, useAppReducer } from './store/appState';

const QUERY_CLIENT = new QueryClient();
const INTERVIEW_STORE_CLIENT = new InterviewStore.API();

// TODO: eventually this should be removed and we should
// load information from browser cache. In the future we
// shouldn't even use browser cache - we should use an
// actual backend store.
// TODO: remove this commented out block when we no longer
// need it as a reference
/*
const ALL_INTERVIEWS: readonly Interview[] = [
  {
    createdDate: new Date(),
    description: 'A sample interview to run a guessing game',
    id: 'guessing-game',
    name: 'Guessing Game',
    screens: [
      {
        displayName: 'Name',
        id: 'NAME',
      },
      {
        displayName: 'Guess',
        id: 'GUESS',
      },
      {
        displayName: 'Incorrect Guess',
        id: 'INCORRECT_GUESS',
      },
      {
        displayName: 'Correct Ending',
        id: 'CORRECT_ENDING',
      },
    ],
  },
];
 */

export default function App(): JSX.Element {
  const [globalState, dispatch] = useAppReducer();

  return (
    <QueryClientProvider client={QUERY_CLIENT}>
      <InterviewStore.Provider value={INTERVIEW_STORE_CLIENT}>
        <AppState.Provider value={globalState}>
          <AppDispatch.Provider value={dispatch}>
            <div className="flex flex-col h-screen text-slate-900 bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<AllInterviewsView />} />
                <Route
                  path="/interview/:interviewId"
                  element={<SingleInterviewView />}
                />
                <Route path="/apidemo" element={<ApiDemo />} />
              </Routes>
            </div>
          </AppDispatch.Provider>
        </AppState.Provider>
      </InterviewStore.Provider>
    </QueryClientProvider>
  );
}
