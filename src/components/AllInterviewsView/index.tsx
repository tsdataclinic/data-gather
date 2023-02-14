import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Button from '../ui/Button';
import InterviewCard from './InterviewCard';
import NewInterviewModal from './NewInterviewModal';
import useInterviewService from '../../hooks/useInterviewService';
import * as Interview from '../../models/Interview';

export default function AllInterviewsView(): JSX.Element {
  const interviewService = useInterviewService();
  const { data: allInterviews = [], isError } = useQuery({
    queryKey: Interview.QueryKeys.allInterviews,
    queryFn: interviewService.interviewAPI.getAllInterviews,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="container mx-auto space-y-8 px-4 pt-8 sm:px-8">
      <div className="flex">
        <h1 className="flex-1 text-3xl tracking-wider">My Interviews</h1>
        <Button
          intent="primary"
          onClick={() => setIsCreateModalOpen(p => !p)}
          className="py-3 tracking-wider"
        >
          New Interview
        </Button>
      </div>

      {isError ? <p>There was an error loading your interviews.</p> : null}

      {allInterviews.length === 0 ? (
        <p>You do not have any interviews.</p>
      ) : null}

      <div className="grid grid-cols-4 gap-4">
        {allInterviews?.map(interview => (
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
