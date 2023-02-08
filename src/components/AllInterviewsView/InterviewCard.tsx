import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import * as Interview from '../../models/Interview';
import Card from '../ui/Card';

type Props = {
  interview: Interview.T;
};

export default function InterviewCard({ interview }: Props): JSX.Element {
  return (
    <Card
      key={interview.id}
      className="transition-all duration-300 hover:border-gray-400"
      linkTo={`/interview/${interview.id}`}
      shadow="xl"
    >
      <div className="flex space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-400 font-mono text-2xl text-gray-50">
          i
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl tracking-wide">{interview.name}</h2>
          <p>Created on {interview.createdDate.toFormat('MMMM d, yyyy')}</p>
          <p>{interview.description}</p>
          <p>
            <Link to={Interview.getRunUrl(interview)}>
              <FontAwesomeIcon size="1x" icon={faPlay} /> Preview
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
