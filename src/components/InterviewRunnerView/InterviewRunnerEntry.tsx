import Form from '../ui/Form';
import InputText from '../ui/InputText';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import assertUnreachable from '../../util/assertUnreachable';
import useAirtableQuery from '../../hooks/useAirtableQuery';
import LabelWrapper from '../ui/LabelWrapper';
import { useDebouncedState } from '../../hooks/useDebouncedState';

type Props = {
  entry: InterviewScreenEntry.T;
};

const AIRTABLE_QUERY_DELAY_MS = 500;

/**
 * A single entry in an interview screen in the runner (e.g. a form input, or radio group).
 *
 * @param entry
 * @returns
 */

export default function InterviewRunnerEntry({ entry }: Props): JSX.Element {
  const [airtableQuery, setAirtableQuery] = useDebouncedState<string>(
    '',
    AIRTABLE_QUERY_DELAY_MS,
  );

  const { isError, isLoading, isSuccess, responseData } = useAirtableQuery(
    airtableQuery,
    entry.responseTypeOptions,
  );

  switch (entry.responseType) {
    case InterviewScreenEntry.ResponseType.Text:
      return (
        <Form.Input
          key={entry.id}
          name={entry.responseId}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.Boolean:
      return (
        <Form.Input
          type="radio"
          name={entry.responseId}
          label={entry.prompt}
          options={[
            { value: 'Yes', displayValue: 'Yes' },
            { value: 'No', displayValue: 'No' },
          ]}
        />
      );
    case InterviewScreenEntry.ResponseType.Number:
      return (
        <Form.Input
          type="number"
          key={entry.id}
          name={entry.responseId}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.Email:
      return (
        <Form.Input
          type="email"
          key={entry.id}
          name={entry.responseId}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.Airtable:
      return (
        <div>
          <LabelWrapper label="Search for record">
            <InputText onChange={(val: string) => setAirtableQuery(val)} />
          </LabelWrapper>
          {isLoading && <p>Loading Airtable records...</p>}
          {isError && (
            <p>
              There was an error loading matching Airtable records. Please try
              again.
            </p>
          )}
          {isSuccess &&
            typeof responseData !== 'string' &&
            responseData.length > 0 && (
              <Form.Dropdown
                key={entry.id}
                name={entry.responseId}
                label={entry.prompt}
                placeholder={isLoading ? 'Loading...' : 'Select a record...'}
                options={
                  isSuccess
                    ? responseData.map((d: any) => ({
                        value: d.id, // TODO -  need to include selected base / table IDs
                        displayValue: JSON.stringify(d.fields),
                      }))
                    : []
                }
              />
            )}
          {isSuccess &&
            typeof responseData !== 'string' &&
            responseData.length < 1 && <p>No matches found</p>}
        </div>
      );
    case InterviewScreenEntry.ResponseType.PhoneNumber:
      return (
        <Form.Input
          type="tel"
          key={entry.id}
          name={entry.responseId}
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
