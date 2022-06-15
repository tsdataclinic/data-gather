import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AppContext from '../AppContext';
import Button from '../ui/Button';
import Sidebar from './Sidebar';

export default function SingleInterviewView(): JSX.Element {
  const { allInterviews } = useContext(AppContext);
  const { interviewId } = useParams();
  const interview = allInterviews.find(iview => iview.id === interviewId);

  if (interview === undefined) {
    return <p>Could not find interview</p>;
  }

  return (
    <div className="flex h-full">
      <Sidebar interview={allInterviews[0]} />
      <div className="flex flex-col flex-1 items-center pt-16 space-y-4 h-full">
        <Button onClick={() => console.log('Test click!')}>Test</Button>
      </div>
    </div>
  );
}
