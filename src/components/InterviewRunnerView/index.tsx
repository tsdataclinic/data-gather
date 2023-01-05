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
import * as SubmissionAction from '../../models/SubmissionAction';
import ConfigurableScript from '../../script/ConfigurableScript';
import { FastAPIService } from '../../api/FastAPIService';
import assertUnreachable from '../../util/assertUnreachable';

type ResponseData = {
  [responseKey: string]: {
    entry: InterviewScreenEntry.T;
    response: string;
  };
};

const api = new FastAPIService();

type Props = {
  interviewId: string;
};

export function InterviewRunnerView(props: Props): JSX.Element | null {
  const { interviewId } = props;
  const interview = useInterview(interviewId);
  const screens = useInterviewScreens(interviewId);
  const actions = useInterviewConditionalActions(interviewId);
  const [currentScreen, setCurrentScreen] = React.useState<
    InterviewScreen.T | undefined
  >(undefined);
  const [responseConsumer, setResponseConsumer] = React.useState<
    ResponseConsumer | undefined
  >(undefined);
  const [finalResponseData, setFinalResponseData] =
    React.useState<ResponseData>({});
  const [complete, setComplete] = React.useState<boolean>(false);
  const entries = useInterviewScreenEntries(interviewId);
  const { mutate: airtableUpdate } = useMutation({
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

  const onInterviewComplete = React.useCallback(
    (responseData: ResponseData): void => {
      setFinalResponseData(responseData);
      if (interview) {
        const allEntries: Map<InterviewScreenEntry.Id, InterviewScreenEntry.T> =
          Object.keys(responseData).reduce(
            (map, responseKey) =>
              map.set(
                responseData[responseKey].entry.id,
                responseData[responseKey].entry,
              ),
            new Map(),
          );

        // handle all on-submit actions
        interview.submissionActions.forEach(submissionAction => {
          switch (submissionAction.type) {
            case SubmissionAction.ActionType.EDIT_ROW: {
              const entryTarget = allEntries.get(submissionAction.target);
              if (entryTarget) {
                const { responseKey } = entryTarget;
                const tableId = entryTarget.responseTypeOptions.selectedTable;
                const airtableRecordId = responseData[responseKey].response;

                // get all fields mapped to their values from other entries
                const fields: { [fieldId: string]: string } = {};
                submissionAction.fieldMappings.forEach((entryId, fieldId) => {
                  if (entryId !== undefined) {
                    const entry = allEntries.get(entryId);
                    if (entry) {
                      const responseVal =
                        responseData[entry.responseKey].response;
                      // ignore empty values
                      if (responseVal !== '') {
                        fields[fieldId] = responseVal;
                      }
                    }
                  }
                });

                airtableUpdate({
                  tableId,
                  fields,
                  recordId: airtableRecordId,
                });
              }
              break;
            }
            case SubmissionAction.ActionType.INSERT_ROW:
              break;
            default:
              assertUnreachable(submissionAction.type);
          }
        });
      }
    },
    [interview, airtableUpdate],
  );

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
    const script: ConfigurableScript = new ConfigurableScript(
      interview,
      actions,
      indexedScreens,
    );

    // Moderator, when prompted to ask, will set state on this component so that it will
    // display the correct screen.
    const moderator: Moderator<InterviewScreen.T> = {
      ask(consumer: ResponseConsumer, screen: InterviewScreen.T) {
        setResponseConsumer(consumer);
        setCurrentScreen(screen);
      },
    };

    // Build interview from script and moderator, and kick it off.
    const engine: Engine<InterviewScreen.T> = new Engine<InterviewScreen.T>(
      script,
      moderator,
    );
    engine.run((result: ResponseData) => {
      setComplete(true);
      onInterviewComplete(result);
    });
  }, [interview, screens, actions, onInterviewComplete]);

  return (
    <div>
      {complete ? (
        <div className="mx-auto mt-8 w-4/6">
          <div className="mb-8 flex flex-col items-center">
            <h1 className="text-2xl">Done!</h1>
          </div>
          <h2 className="mb-2 text-xl">Responses:</h2>
          <dl>
            {Object.values(finalResponseData).map(response => (
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
              responseConsumer={responseConsumer}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Runs an interview based on the ID of the interview in the URL params.
 */
export function InterviewRunnerViewRoute(): JSX.Element | null {
  const { interviewId } = useParams();
  if (interviewId) {
    return <InterviewRunnerView interviewId={interviewId} />;
  }
  return null;
}
