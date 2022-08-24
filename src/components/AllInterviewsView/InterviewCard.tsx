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
      className="w-1/4"
      linkTo={`/interview/${interview.id}`}
    >
      <div className="flex space-x-4">
        <div className="w-16 h-16 bg-gray-400 rounded-full" />
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl tracking-wide">{interview.name}</h2>
          <p>Created on {interview.createdDate.toFormat('MMMM dd, yyyy')}</p>
          <p>{interview.description}</p>
          <p>
            <Link to={`/interview/${interview.id}/run`}>
              <FontAwesomeIcon size="1x" icon={faPlay} /> Run
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
