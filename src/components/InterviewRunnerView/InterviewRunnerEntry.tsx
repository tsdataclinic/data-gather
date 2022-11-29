import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import assertUnreachable from '../../util/assertUnreachable';

type Props = {
  entry: InterviewScreenEntry.T;
};

/**
 * A single entry in an interview screen in the runner (e.g. a form input, or radio group).
 *
 * @param entry
 * @returns
 */
export default function InterviewRunnerEntry({ entry }: Props): JSX.Element {
  switch (entry.responseType) {
    case InterviewScreenEntry.ResponseType.TEXT:
      return (
        <Form.Input
          key={entry.id}
          name={entry.responseKey}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.BOOLEAN:
      return (
        <Form.Input
          type="radio"
          name={entry.responseKey}
          label={entry.prompt}
          options={[
            { value: true, displayValue: 'Yes' },
            { value: false, displayValue: 'No' },
          ]}
        />
      );
    case InterviewScreenEntry.ResponseType.NUMBER:
      return (
        <Form.Input
          type="number"
          key={entry.id}
          name={entry.responseKey}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.EMAIL:
      return (
        <Form.Input
          type="email"
          key={entry.id}
          name={entry.responseKey}
          label={entry.prompt}
        />
      );
    default:
      assertUnreachable(entry.responseType, { throwError: false });
      return (
        <div>
          <em>
            Response type &quot;{entry.responseType}&quot; not implemented.
          </em>
        </div>
      );
  }
}
