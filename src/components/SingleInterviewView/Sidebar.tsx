import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Interview } from '../../types';

type Props = {
  interview: Interview;
};

export default function Sidebar({ interview }: Props): JSX.Element {
  return (
    <nav className="px-8 pt-8 space-y-4">
      <h1 className="text-3xl tracking-wider">{interview.name}</h1>
      <div>Configure</div>
      <ul className="space-y-4">
        {interview.screens.map(({ displayName, id }) => (
          <li key={id}>
            <span className="pr-2">
              <FontAwesomeIcon size="1x" icon={faPenToSquare} />
            </span>
            {displayName}
          </li>
        ))}
      </ul>
    </nav>
  );
}
