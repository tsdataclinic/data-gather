import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import AllInterviewsView from './components/AllInterviewsView';
import Header from './components/Header';
import InterviewRunnerView from './components/InterviewRunnerView';
import SingleInterviewView from './components/SingleInterviewView';
import InterviewService from './services/InterviewService';
import { AppState, AppDispatch, useAppReducer } from './store/appState';
import AuthProvider from './auth/AuthProvider';

const QUERY_CLIENT = new QueryClient();
const INTERVIEW_API_CLIENT = new InterviewService.API();

export default function App(): JSX.Element {
  const [globalState, dispatch] = useAppReducer();

  return (
    <AuthProvider>
      <QueryClientProvider client={QUERY_CLIENT}>
        <InterviewService.Provider client={INTERVIEW_API_CLIENT}>
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
                </Routes>
              </div>
            </AppDispatch.Provider>
          </AppState.Provider>
        </InterviewService.Provider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
