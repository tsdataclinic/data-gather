import { useParams } from 'react-router-dom';
import { InterviewRunnerView } from '../InterviewRunnerView';
import userVanityUrl from '../../hooks/useVanityUrl';

export default function PublishedInterviewView(): JSX.Element | null {
  const { vanityUrl } = useParams();

  const interview = userVanityUrl(vanityUrl);

  if (interview) {
    return <InterviewRunnerView interviewId={interview.id} />;
  }
  return null;
}
