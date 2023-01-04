import { useParams } from 'react-router-dom';
import { InterviewRunnerView } from '../InterviewRunnerView';
import useVanityUrl from '../../hooks/useVanityUrl';

export default function PublishedInterviewView(): JSX.Element | null {
  const { vanityUrl } = useParams();

  const interview = useVanityUrl(vanityUrl);

  if (interview) {
    // TODO: make this work while not authenticated
    return <InterviewRunnerView interviewId={interview.id} />;
  }
  return null;
}
