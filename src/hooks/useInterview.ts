import GuessingGameScript from './GuessingGameScript';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { GuessingGameQuestion } from '../GuessingGameQuestion';
import {
  Interview,
  ResponseData,
  ResponseConsumer,
} from '@dataclinic/interview';
import GuessingGameModerator from './GuessingGameModerator';

type SubmitAnswerFn = (data?: ResponseData) => void;

/**
 * This hook exposes the necessary data and functions to allow execution of
 * the GuessingGame interview.
 *
 * @returns {object} Object with the following parameters:
 *   - question (GuessingGameQuestion | undefined) The current question
 *   - responseData (ResponseData) All response data collected so far
 *   - submitAnswer (SubmitAnswerFn) A function to submit a new response
 *   - isInterviewComplete (boolean) Whether or not the interview is finished
 */
export default function useInterview(): {
  question: GuessingGameQuestion | undefined;
  responseData: ResponseData;
  submitAnswer: SubmitAnswerFn;
  isInterviewComplete: boolean;
} {
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [question, setQuestion] = useState<GuessingGameQuestion>();
  const [responseConsumer, setResponseConsumer] = useState<
    ResponseConsumer | undefined
  >();
  const [responseData, setResponseData] = useState<ResponseData>({});

  const interview = useMemo(() => {
    const script = new GuessingGameScript();
    const moderator = new GuessingGameModerator(
      setQuestion,
      setResponseConsumer,
      setResponseData,
    );
    return new Interview(script, moderator);
  }, []);

  useEffect(() => {
    interview.run((result: ResponseData) => {
      setResponseData(result);
      setIsInterviewComplete(true);
    });
  }, [interview]);

  const submitAnswer = useCallback(
    (data?: ResponseData) => {
      if (responseConsumer) {
        if (data) {
          responseConsumer.answer(data);
        }
        responseConsumer.submit();
      }
    },
    [responseConsumer],
  );

  return { question, responseData, submitAnswer, isInterviewComplete };
}
