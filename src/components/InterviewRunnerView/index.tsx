import * as React from 'react';
import {
  Interview as Engine,
  Moderator,
  ResponseConsumer,
} from '@dataclinic/interview';
import { useParams, useNavigate } from 'react-router-dom';
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
import type { ResponseData } from '../../script/types';
import Button from '../ui/Button';

const api = new FastAPIService();

type Props = {
  interviewId: string;
};

function getSpecialValueForSubmission(
  specialValueType: SubmissionAction.SpecialValueType,
): string {
  switch (specialValueType) {
    case SubmissionAction.SpecialValueType.NOW_DATE:
      return new Date().toISOString();
    default:
      return assertUnreachable(specialValueType);
  }
}

export function InterviewRunnerView(props: Props): JSX.Element | null {
  const navigate = useNavigate();

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
  const { mutate: airtableUpdateRecord } = useMutation({
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

  const { mutate: airtableCreateRecord } = useMutation({
    mutationFn: (data: {
      fields: { [fieldName: string]: string };
      tableId: string;
    }) => api.airtable.createAirtableRecord(data.tableId, data.fields),
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
          const { config: actionConfig } = submissionAction;
          switch (actionConfig.type) {
            case SubmissionAction.ActionType.EDIT_ROW: {
              const actionPayload = actionConfig.payload;
              const entryTarget = allEntries.get(actionPayload.entryId);

              if (
                entryTarget &&
                entryTarget.responseType ===
                  InterviewScreenEntry.ResponseType.AIRTABLE
              ) {
                const tableId = entryTarget.responseTypeOptions.selectedTable;
                const airtableRecordId = ConfigurableScript.getResponseValue(
                  responseData,
                  entryTarget.responseKey,
                  actionPayload.primaryKeyField,
                );

                if (airtableRecordId) {
                  // get all fields mapped to their values collected from the
                  // entry responses
                  const fields: { [fieldId: string]: string } = {};
                  submissionAction.fieldMappings.forEach(
                    (entryLookupConfig, fieldId) => {
                      const { entryId, responseFieldKey, specialValueType } =
                        entryLookupConfig;
                      let responseValue = '';
                      if (entryId) {
                        const entry = allEntries.get(entryId);
                        if (entry) {
                          responseValue =
                            ConfigurableScript.getResponseValue(
                              responseData,
                              entry.responseKey,
                              responseFieldKey,
                            ) ?? '';
                        }
                      } else if (specialValueType) {
                        responseValue =
                          getSpecialValueForSubmission(specialValueType);
                      }

                      // ignore empty values
                      if (responseValue !== '') {
                        fields[fieldId] = responseValue;
                      }
                    },
                  );

                  airtableUpdateRecord({
                    tableId,
                    fields,
                    recordId: airtableRecordId,
                  });
                }
              }
              break;
            }

            case SubmissionAction.ActionType.INSERT_ROW: {
              const { tableTarget } = actionConfig.payload;

              // collect all field values
              // TODO: this is duplicate code from the EDIT_ROW section. We
              // should get a reusable function to collect fieldMappings.
              const fields: { [fieldId: string]: string } = {};
              submissionAction.fieldMappings.forEach(
                (entryLookupConfig, fieldId) => {
                  const { entryId, responseFieldKey, specialValueType } =
                    entryLookupConfig;
                  let responseValue = '';
                  if (entryId) {
                    const entry = allEntries.get(entryId);
                    if (entry) {
                      responseValue =
                        ConfigurableScript.getResponseValue(
                          responseData,
                          entry.responseKey,
                          responseFieldKey,
                        ) ?? '';
                    }
                  } else if (specialValueType) {
                    responseValue =
                      getSpecialValueForSubmission(specialValueType);
                  }

                  // ignore empty values
                  if (responseValue !== '') {
                    fields[fieldId] = responseValue;
                  }
                },
              );

              airtableCreateRecord({
                fields,
                tableId: tableTarget,
              });
              break;
            }
            default:
              assertUnreachable(actionConfig);
          }
        });
      }
    },
    [interview, airtableUpdateRecord, airtableCreateRecord],
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

  const handleRestart = (): void => {
    navigate(0);
  };

  return (
    <div>
      {complete ? (
        <div className="mx-auto mt-8 w-4/6">
          <div className="mb-8 flex flex-row justify-between">
            <h1 className="text-2xl">Done!</h1>
            <Button onClick={handleRestart} intent="primary">
              Start a new interview
            </Button>
          </div>
          <h2 className="mb-2 text-xl">Responses:</h2>
          <dl>
            {Object.values(finalResponseData).map(response => (
              <React.Fragment key={response.entry.responseKey}>
                {/* TODO UI should support multiple language prompts rather than hardcoding english */}
                <dt className="font-bold">{response.entry.prompt.en}:</dt>
                <dd className="mb-2 pl-8">
                  {ConfigurableScript.getResponseValue(
                    finalResponseData,
                    response.entry.responseKey,
                  )}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      ) : (
        <div>
          {interview && currentScreen && entries && responseConsumer && (
            <InterviewRunnerScreen
              interview={interview}
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
