import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppContext from '../AppContext';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import Sidebar from './Sidebar';

export default function SingleInterviewView(): JSX.Element {
  const [text, setText] = useState('');
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
        <TextArea value={text} onChange={setText} />
        <Button onClick={() => console.log('Test click!')}>Test</Button>
      </div>
    </div>
  );
}
