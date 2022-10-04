import { useMemo, useState } from 'react';
import useAppState from '../../hooks/useAppState';
import Button from '../ui/Button';
import InterviewCard from './InterviewCard';
import NewInterviewModal from './NewInterviewModal';
import useLoadInitialInterviews from './useLoadInitialInterviews';

export default function AllInterviewsView(): JSX.Element {
  const { isError } = useLoadInitialInterviews();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { loadedInterviews } = useAppState();

  const interviews = useMemo(
    () => Array.from(loadedInterviews.values()),
    [loadedInterviews],
  );

  return (
    <div className="container mx-auto space-y-8 pt-8">
      <div className="flex">
        <h1 className="flex-1 text-3xl tracking-wider">My Interviews</h1>
        <Button
          onClick={() => setIsCreateModalOpen(p => !p)}
          className="py-3 tracking-wider"
        >
          New Interview
        </Button>
      </div>

      {isError ? <p>There was an error loading your interviews.</p> : null}

      {interviews.length === 0 ? <p>You do not have any interviews.</p> : null}

      <div className="space-x-4">
        {interviews.map(interview => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </div>

      <NewInterviewModal
        isOpen={isCreateModalOpen}
        onDismiss={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
