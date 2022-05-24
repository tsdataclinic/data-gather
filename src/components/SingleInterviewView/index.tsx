import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import logo from '../../logo.svg';
import AppContext from '../AppContext';
import SampleInterview from '../SampleInterview';
import Sidebar from './Sidebar';

// This is here just as an example of styled-components usage. This can be
// removed at any time.
const StyledImg = styled.img`
  height: 100px;
`;

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
        <StyledImg src={logo} alt="logo" />
        <SampleInterview />
      </div>
    </div>
  );
}
