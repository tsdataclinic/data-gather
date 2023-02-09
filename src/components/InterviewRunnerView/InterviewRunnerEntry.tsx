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
  defaultLanguage: string;
  entry: InterviewScreenEntry.T;
  selectedLanguage: string;
};

const AIRTABLE_QUERY_DELAY_MS = 500;

/**
 * A single entry in an interview screen in the runner (e.g. a form input,
 * or radio group).
 */
export default function InterviewRunnerEntry({
  entry,
  selectedLanguage,
  defaultLanguage,
}: Props): JSX.Element {
  const airtableHiddenInputRef = React.useRef<HTMLInputElement | null>(null);
  const [airtableQuery, setAirtableQuery] = useDebouncedState<string>(
    '',
    AIRTABLE_QUERY_DELAY_MS,
  );

  const { isError, isLoading, isSuccess, responseData } = useAirtableQuery(
    airtableQuery,
    entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
      ? entry.responseTypeOptions
      : undefined,
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

  const { responseType } = entry;
  const entryPrompt =
    entry.prompt[selectedLanguage] || entry.prompt[defaultLanguage];
  const entryHelperText =
    entry.text[selectedLanguage] || entry.text[defaultLanguage];

  switch (responseType) {
    case InterviewScreenEntry.ResponseType.TEXT:
      return (
        <Form.Input
          key={entry.id}
          name={entry.responseKey}
          label={entryPrompt}
          helperText={entryHelperText}
          required={entry.required}
        />
      );
    case InterviewScreenEntry.ResponseType.BOOLEAN:
      return (
        <Form.Input
          type="radio"
          name={entry.responseKey}
          label={entryPrompt}
          helperText={entryHelperText}
          required={entry.required}
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
          required={entry.required}
          label={entryPrompt}
          helperText={entryHelperText}
        />
      );
    case InterviewScreenEntry.ResponseType.EMAIL:
      return (
        <Form.Input
          type="email"
          key={entry.id}
          name={entry.responseKey}
          required={entry.required}
          label={entryPrompt}
          helperText={entryHelperText}
        />
      );
    case InterviewScreenEntry.ResponseType.AIRTABLE:
      return (
        <div>
          <strong>{entryPrompt}</strong>
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
                      airtableHiddenInputRef.current.value = JSON.stringify(
                        e.data,
                      );
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
          label={entryPrompt}
          required={entry.required}
          helperText={entryHelperText}
        />
      );
    case InterviewScreenEntry.ResponseType.SINGLE_SELECT:
      return (
        <Form.Dropdown
          label={entryPrompt}
          required={entry.required}
          name={entry.responseKey}
          options={entry.responseTypeOptions.options.map(opt => ({
            displayValue: opt.value,
            value: opt.value,
          }))}
          helperText={entryHelperText}
          placeholder="Select one"
        />
      );
    default:
      assertUnreachable(responseType, { throwError: false });
      return (
        <div>
          <em>Response type &quot;{responseType}&quot; not implemented.</em>
        </div>
      );
  }
}
