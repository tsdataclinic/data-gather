import { useContext } from 'react';
import AppContext from '../AppContext';
import InterviewCard from './InterviewCard';

export default function AllInterviewsView(): JSX.Element {
  const { allInterviews } = useContext(AppContext);

  return (
    <div className="container pt-8 mx-auto space-y-8">
      <h1 className="text-3xl tracking-wider">My Interviews</h1>
      {allInterviews.map(iview => (
        <InterviewCard key={iview.id} interview={iview} />
      ))}
    </div>
  );
}
