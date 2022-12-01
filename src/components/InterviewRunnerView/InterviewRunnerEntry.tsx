import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import { useEffect, useState } from 'react';
import Form from '../ui/Form';
import InputText from '../ui/InputText';
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
  const [airtableQuery, setAirtableQuery] = useDebouncedState<string>(
    '',
    AIRTABLE_QUERY_DELAY_MS,
  );

  const { isError, isLoading, isSuccess, responseData } = useAirtableQuery(
    airtableQuery,
    entry.responseTypeOptions,
  );

  // const gridRef = useRef();
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState<Array<Record<string, string>>>();

  useEffect(() => {
    if (!responseData || responseData.length < 1) return;
    // TODO - get superset of all fields returned
    setColumnDefs(
      Object.keys(responseData[0].fields).map(f => ({
        field: f,
      })),
    );

    setRowData(
      responseData.map((d: any) => ({
        id: d.id,
        ...d.fields,
      })),
    );
  }, [responseData]);

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
    case InterviewScreenEntry.ResponseType.AIRTABLE:
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
              <>
                <strong>{entry.prompt}</strong>
                <div
                  className="ag-theme-alpine"
                  style={{ width: '100%', height: 250 }}
                >
                  <AgGridReact
                    // TODO - handle row selection
                    onRowClicked={e => console.log(e)}
                    onRowDoubleClicked={e => console.log(e)}
                    rowSelection="single"
                    rowData={rowData}
                    columnDefs={columnDefs}
                  />
                </div>
              </>
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
