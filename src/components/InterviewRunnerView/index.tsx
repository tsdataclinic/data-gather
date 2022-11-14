import {
  Interview as Engine,
  Moderator,
  ResponseConsumer,
  ResponseData,
} from '@dataclinic/interview';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useInterview from '../../hooks/useInterview';
import useInterviewScreenEntries from '../../hooks/useInterviewScreenEntries';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import InterviewRunnerScreen from './InterviewRunnerScreen';
import useInterviewConditionalActions from '../../hooks/useInterviewConditionalActions';
import * as InterviewScreen from '../../models/InterviewScreen';
import ConfigurableScript from '../../script/ConfigurableScript';

/**
 * Runs an interview based on the ID of the interview in the URL params.
 */
export default function InterviewRunnerView(): JSX.Element | null {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId);
  const screens = useInterviewScreens(interviewId);
  const actions = useInterviewConditionalActions(interviewId);
  const [currentScreen, setCurrentScreen] = useState<
    InterviewScreen.T | undefined
  >(undefined);
  const [responseConsumer, setResponseConsumer] = useState<
    ResponseConsumer | undefined
  >(undefined);
  const [responseData, setResponseData] = useState<ResponseData>({});
  const [complete, setComplete] = useState<boolean>(false);
  const entries = useInterviewScreenEntries(interviewId);

  // Construct and run an interview on component load.
  useEffect(() => {
    if (!interview || !screens || !actions) {
      return;
    }

    // Load screens for interview and index them by their ID
    const indexedScreens: Map<string, InterviewScreen.T> = new Map();
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

  return (
    <div>
      {complete ? (
        <div className="mx-auto mt-8 w-4/6">
          <div className="mb-8 flex flex-col items-center">
            <h1 className="text-2xl">Done!</h1>
          </div>
          <h2 className="mb-2 text-xl">Responses:</h2>
          <dl>
            {Object.entries(responseData).map(([key, value]) => (
              <>
                <dt className="font-bold">{key}:</dt>
                <dd className="mb-2 pl-8">{value}</dd>
              </>
            ))}
          </dl>
        </div>
      ) : (
        <div>
          {currentScreen && currentScreen && entries && responseConsumer && (
            <InterviewRunnerScreen
              screen={currentScreen}
              entries={entries}
              responseData={responseData}
              responseConsumer={responseConsumer}
            />
          )}
        </div>
      )}
    </div>
  );
}
