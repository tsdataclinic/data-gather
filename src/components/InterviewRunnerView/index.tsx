import * as React from 'react';
import {
  Interview as Engine,
  Moderator,
  ResponseConsumer,
} from '@dataclinic/interview';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useInterview from '../../hooks/useInterview';
import useInterviewScreenEntries from '../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import InterviewRunnerScreen from './InterviewRunnerScreen';
import useInterviewConditionalActions from '../../hooks/useInterviewConditionalActions';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import ConfigurableScript from '../../script/ConfigurableScript';
import { FastAPIService } from '../../api/FastAPIService';

type ResponseData = {
  [responseKey: string]: {
    entry: InterviewScreenEntry.T;
    response: string;
  };
};

const api = new FastAPIService();

/**
 * Runs an interview based on the ID of the interview in the URL params.
 */
export default function InterviewRunnerView(): JSX.Element | null {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const screens = useInterviewScreens(interviewId);
  const actions = useInterviewConditionalActions(interviewId);
  const [currentScreen, setCurrentScreen] = React.useState<
    InterviewScreen.T | undefined
  >(undefined);
  const [responseConsumer, setResponseConsumer] = React.useState<
    ResponseConsumer | undefined
  >(undefined);
  const [responseData, setResponseData] = React.useState<ResponseData>({});
  const [complete, setComplete] = React.useState<boolean>(false);
  const entries = useInterviewScreenEntries(interviewId);
  const airtableMutation = useMutation({
    mutationFn: (data: {
      fields: { [fieldName: string]: string };
      recordId: string;
      tableId: string;
    }) =>
      api.airtable.updateAirtableRecord(
        data.tableId,
        data.recordId,
        data.fields,
      ),
  });

  // Construct and run an interview on component load.
  React.useEffect(() => {
    if (!interview || !screens || !actions) {
      return;
    }

    // Load screens for interview and index them by their ID
    const indexedScreens: Map<string, InterviewScreen.WithChildrenT> =
      new Map();
    screens.forEach(screen => indexedScreens.set(screen.id, screen));

    // Create a script from the interview definition
    // TODO: Also include actions in the script creation
    const script: ConfigurableScript = new ConfigurableScript(
      interview,
      actions,
      indexedScreens,
    );

    // Moderator, when prompted to ask, will set state on this component so that it will
    // display the correct screen.
    const moderator: Moderator<InterviewScreen.T> = {
      ask(
        consumer: ResponseConsumer,
        screen: InterviewScreen.T,
        data: ResponseData,
      ) {
        setResponseConsumer(consumer);
        setCurrentScreen(screen);
        setResponseData(data);
      },
    };

    // Build interview from script and moderator, and kick it off.
    const engine: Engine<InterviewScreen.T> = new Engine<InterviewScreen.T>(
      script,
      moderator,
    );
    engine.run((result: ResponseData) => {
      setResponseData(result);
      setComplete(true);
    });
  }, [interview, screens, actions]);

  // on interview complete
  React.useEffect(() => {
    if (complete) {
      // write back any necessary airtable data.
      // first, find if any entry specified a writeback
      const writebacks = Object.values(responseData).filter(
        response => !!response.entry.writebackOptions,
      );

      // next, find if any entry specified an airtable record
      const airtableRecordResponseKey = Object.values(responseData).find(
        response =>
          response.entry.responseType ===
          InterviewScreenEntry.ResponseType.AIRTABLE,
      )?.entry.responseKey;

      // from the entry that collected the airtable lookup, now get the
      // selected record id from the responseData
      const airtableRecordId = airtableRecordResponseKey
        ? responseData[airtableRecordResponseKey].response
        : undefined;
      if (airtableRecordId) {
        writebacks.forEach(writeback => {
          const valueToWrite = writeback.response;
          const fieldName = writeback.entry.writebackOptions?.selectedFields[0];
          const tableId = writeback.entry.writebackOptions?.selectedTable;
          if (fieldName && tableId) {
            airtableMutation.mutate({
              tableId,
              recordId: airtableRecordId,
              fields: {
                [fieldName]: valueToWrite,
              },
            });
          }
        });
      }
    }
  }, [complete, airtableMutation, responseData]);

  return (
    <div>
      {complete ? (
        <div className="mx-auto mt-8 w-4/6">
          <div className="mb-8 flex flex-col items-center">
            <h1 className="text-2xl">Done!</h1>
          </div>
          <h2 className="mb-2 text-xl">Responses:</h2>
          <dl>
            {Object.values(responseData).map(response => (
              <>
                <dt className="font-bold">{response.entry.prompt}:</dt>
                <dd className="mb-2 pl-8">{response.response}</dd>
              </>
            ))}
          </dl>
        </div>
      ) : (
        <div>
          {currentScreen && currentScreen && entries && responseConsumer && (
            <InterviewRunnerScreen
              screen={currentScreen}
              entries={entries.get(currentScreen.id) ?? []}
              responseData={responseData}
              responseConsumer={responseConsumer}
            />
          )}
        </div>
      )}
    </div>
  );
}
