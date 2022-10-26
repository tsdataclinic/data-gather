import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

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
    case 'text':
      return (
        <Form.Input
          key={entry.id}
          name={entry.responseId}
          label={entry.prompt}
        />
      );
    case 'boolean':
      return (
        <Form.Input
          type="radio"
          name={entry.responseId}
          label={entry.prompt}
          options={[
            { value: true, displayValue: 'Yes' },
            { value: false, displayValue: 'No' },
          ]}
        />
      );
    case 'number':
      return (
        <Form.Input
          type="number"
          key={entry.id}
          name={entry.responseId}
          label={entry.prompt}
        />
      );
    default:
      return (
        <div>
          <em>
            Response type &quot;{entry.responseType}&quot; not implemented.
          </em>
        </div>
      );
  }
}
