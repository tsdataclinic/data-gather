import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import AllInterviewsView from './components/AllInterviewsView';
import Header from './components/Header';
import InterviewRunnerView from './components/InterviewRunnerView';
import SingleInterviewView from './components/SingleInterviewView';
import ApiDemo from './components/apiDemo';
import InterviewStore from './store/InterviewStore';
import { AppState, AppDispatch, useAppReducer } from './store/appState';
import AuthProvider from './auth/AuthProvider';
import getAuthToken from './auth/getAuthToken';

const QUERY_CLIENT = new QueryClient();
const INTERVIEW_STORE_CLIENT = new InterviewStore.API();

export default function App(): JSX.Element {
  const [globalState, dispatch] = useAppReducer();
  console.log('auth token?', getAuthToken());

  return (
    <AuthProvider>
      <QueryClientProvider client={QUERY_CLIENT}>
        <InterviewStore.Provider value={INTERVIEW_STORE_CLIENT}>
          <AppState.Provider value={globalState}>
            <AppDispatch.Provider value={dispatch}>
              <div className="flex h-screen flex-col bg-gray-50 text-slate-900">
                <Header />
                <Routes>
                  <Route path="/" element={<AllInterviewsView />} />
                  <Route
                    path="/interview/:interviewId/run"
                    element={<InterviewRunnerView />}
                  />
                  <Route
                    path="/interview/:interviewId/*"
                    element={<SingleInterviewView />}
                  />
                  <Route path="/apidemo" element={<ApiDemo />} />
                </Routes>
              </div>
            </AppDispatch.Provider>
          </AppState.Provider>
        </InterviewStore.Provider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
