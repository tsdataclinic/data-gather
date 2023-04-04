import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import InputText from '../ui/InputText';
import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import * as Interview from '../../models/Interview';
import * as InterviewSetting from '../../models/InterviewSetting';
import assertUnreachable from '../../util/assertUnreachable';
import useAirtableQuery from '../../hooks/useAirtableQuery';
import LabelWrapper from '../ui/LabelWrapper';
import { useDebouncedState } from '../../hooks/useDebounce';

type Props = {
  defaultLanguage: string;
  entry: InterviewScreenEntry.T;
  interview: Interview.WithScreensAndActions;
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
  interview,
}: Props): JSX.Element {
  const airtableHiddenInputRef = React.useRef<HTMLInputElement | null>(null);
  const [airtableQuery, setAirtableQuery] = useDebouncedState<string>(
    '',
    AIRTABLE_QUERY_DELAY_MS,
  );

  const { isError, isLoading, isSuccess, responseData } = useAirtableQuery(
    airtableQuery,
    interview.id,
    entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
      ? entry.responseTypeOptions
      : undefined,
  );

  const interviewSetting = interview?.interviewSettings.find(
    intSetting => intSetting.type === InterviewSetting.SettingType.AIRTABLE,
  );
  const airtableSettings = interviewSetting?.settings;

  const allAirtableFields = React.useMemo(
    () =>
      airtableSettings?.bases?.flatMap(base =>
        base.tables?.flatMap(table => table.fields),
      ),
    [airtableSettings?.bases],
  );

  const [rowData, setRowData] = React.useState();
  const [columnDefs, setColumnDefs] =
    React.useState<Array<Record<string, string>>>();

  // when new airtable response data comes in, reset the table headers
  // and data
  React.useEffect(() => {
    if (!responseData || responseData.length < 1) {
      return;
    }
    if (entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE) {
      // set the subset of fields to display from the results
      const fieldsToDisplayInTable: string[] =
        entry.responseTypeOptions.selectedFields;
      setColumnDefs(fieldsToDisplayInTable.map(f => ({ field: f })));

      // row data should include all fields, even if we only display a subset
      setRowData(
        responseData.map((d: any) => ({
          id: d.id,
          ...d.fields,
        })),
      );
    }
  }, [responseData, entry]);

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
            <InputText
              required
              onChange={(val: string) => setAirtableQuery(val)}
            />
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
                className="ag-theme-alpine mt-4"
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
                  headerHeight={50}
                  rowHeight={50}
                  defaultColDef={{
                    headerClass: 'bg-gray-200',
                    cellStyle: {
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                    },
                  }}
                  className="text-lg"
                  rowSelection="single"
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            )}
          {isSuccess &&
            typeof responseData !== 'string' &&
            responseData.length < 1 && <p className="mt-2">No matches found</p>}
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
    case InterviewScreenEntry.ResponseType.SINGLE_SELECT: {
      const { responseTypeOptions, required, responseKey } = entry;
      const { airtableConfig, options: manualOptions } = responseTypeOptions;

      // if an airtable config is given then we pull the options from there
      const options =
        airtableConfig !== undefined
          ? allAirtableFields
              ?.find(field => field?.name === airtableConfig.selectedFields[0])
              ?.options?.choices?.map(opt => opt.name ?? '') ?? []
          : manualOptions.map(opt => opt.value);

      return (
        <Form.Dropdown
          label={entryPrompt}
          required={required}
          name={responseKey}
          options={options.map(optValue => ({
            displayValue: optValue,
            value: optValue,
          }))}
          helperText={entryHelperText}
          placeholder="Select one"
        />
      );
    }
    default:
      assertUnreachable(responseType, { throwError: false });
      return (
        <div>
          <em>Response type &quot;{responseType}&quot; not implemented.</em>
        </div>
      );
  }
}
