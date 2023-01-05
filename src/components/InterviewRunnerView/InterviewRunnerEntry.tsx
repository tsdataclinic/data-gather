import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import InputText from '../ui/InputText';
import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import assertUnreachable from '../../util/assertUnreachable';
import useAirtableQuery from '../../hooks/useAirtableQuery';
import LabelWrapper from '../ui/LabelWrapper';
import { useDebouncedState } from '../../hooks/useDebounce';

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
  const airtableHiddenInputRef = React.useRef<HTMLInputElement | null>(null);
  const [airtableQuery, setAirtableQuery] = useDebouncedState<string>(
    '',
    AIRTABLE_QUERY_DELAY_MS,
  );

  const { isError, isLoading, isSuccess, responseData } = useAirtableQuery(
    airtableQuery,
    entry.responseTypeOptions,
  );

  const [rowData, setRowData] = React.useState();
  const [columnDefs, setColumnDefs] =
    React.useState<Array<Record<string, string>>>();

  // when new airtable response data comes in, reset the table headers
  // and data
  React.useEffect(() => {
    if (!responseData || responseData.length < 1) return;
    // collect superset of all fields from all results
    const allFields: string[] = [];
    const seenFields: Set<string> = new Set();
    responseData.forEach((row: { fields: Record<string, string> }) => {
      const fieldNames: string[] = Object.keys(row.fields);
      fieldNames.forEach(fieldName => {
        if (!seenFields.has(fieldName)) {
          seenFields.add(fieldName);
          allFields.push(fieldName);
        }
      });
    });

    setColumnDefs(allFields.map(f => ({ field: f })));
    setRowData(
      responseData.map((d: any) => ({
        id: d.id,
        ...d.fields,
      })),
    );
  }, [responseData]);

  // TODO: whether or not something is required should be configurable
  switch (entry.responseType) {
    case InterviewScreenEntry.ResponseType.TEXT:
      return (
        <Form.Input
          key={entry.id}
          name={entry.responseKey}
          label={entry.prompt}
          required={false}
        />
      );
    case InterviewScreenEntry.ResponseType.BOOLEAN:
      return (
        <Form.Input
          type="radio"
          name={entry.responseKey}
          label={entry.prompt}
          required={false}
          options={[
            { value: 'Yes', displayValue: 'Yes' },
            { value: 'No', displayValue: 'No' },
          ]}
        />
      );
    case InterviewScreenEntry.ResponseType.NUMBER:
      return (
        <Form.Input
          type="number"
          key={entry.id}
          name={entry.responseKey}
          required={false}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.EMAIL:
      return (
        <Form.Input
          type="email"
          key={entry.id}
          name={entry.responseKey}
          required={false}
          label={entry.prompt}
        />
      );
    case InterviewScreenEntry.ResponseType.AIRTABLE:
      return (
        <div>
          <strong>{entry.prompt}</strong>
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
              <div
                className="ag-theme-alpine"
                style={{ width: '100%', height: 250 }}
              >
                <input
                  ref={airtableHiddenInputRef}
                  type="hidden"
                  name={entry.responseKey}
                />
                <AgGridReact
                  onRowClicked={e => {
                    if (airtableHiddenInputRef.current) {
                      airtableHiddenInputRef.current.value = e.data.id;
                    }
                  }}
                  rowSelection="single"
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            )}
          {isSuccess &&
            typeof responseData !== 'string' &&
            responseData.length < 1 && <p>No matches found</p>}
        </div>
      );
    case InterviewScreenEntry.ResponseType.PHONE_NUMBER:
      return (
        <Form.Input
          type="tel"
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
