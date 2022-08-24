import {
  Interview as Engine,
  Moderator,
  ResponseConsumer,
  ResponseData,
} from '@dataclinic/interview';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useInterview from '../../hooks/useInterview';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import ConfigurableScript from '../../script/ConfigurableScript';
import { ScriptConfigSchema } from '../../script/ScriptConfigSchema';
import { buildScriptConfig, InterviewScreenAdapter } from './adapters';

// import useInterviewConditionalActions from "../../hooks/useInterviewConditionalActions";
// import useInterviewScreenEntries from "../../hooks/useInterviewScreenEntries";

export default function InterviewRunnerView(): JSX.Element | null {
  const { interviewId } = useParams();
  const interview = useInterview(interviewId ?? '');
  const screens = useInterviewScreens(interviewId ?? '');
  const [currentScreen, setCurrentScreen] =
    useState<InterviewScreenAdapter | null>(null);
  const [responseConsumer, setResponseConsumer] =
    useState<ResponseConsumer | null>(null);

  // const entries = useInterviewScreenEntries(interviewId ?? '');
  // const actions = useInterviewConditionalActions(interviewId ?? '');

  if (!interview || !screens) {
    throw new Error('Interview was not defined, or missing data');
  }

  useEffect(() => {
    const indexedScreens: { [screenId: string]: InterviewScreenAdapter } = {};
    screens.forEach(screen => {
      indexedScreens[screen.id] = new InterviewScreenAdapter(screen);
    });

    const scriptConfig: ScriptConfigSchema = buildScriptConfig(interview);
    const script: ConfigurableScript<InterviewScreenAdapter> =
      new ConfigurableScript(scriptConfig, id => indexedScreens[id]);

    const moderator: Moderator<InterviewScreenAdapter> = {
      ask(consumer: ResponseConsumer, screen: InterviewScreenAdapter) {
        setResponseConsumer(consumer);
        setCurrentScreen(screen);
      },
    };

    const engine: Engine<InterviewScreenAdapter> =
      new Engine<InterviewScreenAdapter>(script, moderator);
    engine.run((results: ResponseData) => {
      console.log(results);
    });
  }, [interview, screens]);

  return (
    <>
      <div>Runner!</div>
      {currentScreen && <p>Current Screen is defined</p>}
      {responseConsumer && <p>Response Consumer is defined</p>}
    </>
  );
}
