import invariant from 'invariant';
import { KeyboardEvent, ChangeEvent, useState } from 'react';
import useInterview from '../hooks/useInterview';
import { GuessingGameQuestion } from '../types';
import assertUnreachable from '../util/assertUnreachable';

export default function SampleInterview(): JSX.Element {
  const [responseText, setResponseText] = useState('');
  const { isInterviewComplete, question, responseData, submitAnswer } =
    useInterview();

  const onTextChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.currentTarget.value;
    setResponseText(val);
  };

  const resetText = (): void => setResponseText('');

  const onSubmitAnswer = (): void => {
    invariant(
      question !== undefined,
      'Question cannot be undefined at this point.',
    );

    // If we aren't at the last page then don't allow an empty response
    if (
      question === undefined ||
      (responseText === '' && question !== GuessingGameQuestion.CORRECT_ENDING)
    ) {
      return;
    }

    resetText();

    switch (question) {
      case GuessingGameQuestion.NAME:
        submitAnswer({ name: responseText.trim() });
        break;
      case GuessingGameQuestion.GUESS:
      case GuessingGameQuestion.INCORRECT_GUESS:
        submitAnswer({
          numbersGuessed: [
            Number(responseText),
            ...(responseData.numbersGuessed || []),
          ],
        });
        break;
      case GuessingGameQuestion.CORRECT_ENDING:
        submitAnswer();
        break;
      default:
        assertUnreachable(question);
    }
  };

  const renderQuestion = (): string | null => {
    if (question === undefined) {
      return null;
    }

    switch (question) {
      case GuessingGameQuestion.NAME:
        return 'What is your name?';
      case GuessingGameQuestion.GUESS:
        return `Hi ${responseData.name}. Guess a number between 1 and 10`;
      case GuessingGameQuestion.INCORRECT_GUESS:
        return 'Not quite. Try again! Guess a number between 1 and 10';
      case GuessingGameQuestion.CORRECT_ENDING:
        return 'Great job!';
      default:
        return assertUnreachable(question);
    }
  };

  const renderInputText = (): JSX.Element | null => {
    // don't render the input text if we made it to the last page
    if (
      question === undefined ||
      question === GuessingGameQuestion.CORRECT_ENDING
    ) {
      return null;
    }

    return (
      <input
        type="text"
        className="p-4 text-3xl text-black rounded-sm border border-gray-400"
        value={responseText}
        onChange={onTextChange}
        onKeyPress={(e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            onSubmitAnswer();
          }
        }}
      />
    );
  };

  if (isInterviewComplete) {
    const guessesInOrder = [...responseData.numbersGuessed].reverse();
    return (
      <div className="space-y-8">
        <p>Congratulations {responseData.name}!</p>
        <p>Your guesses were {guessesInOrder.join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <p>{renderQuestion()}</p>
      {renderInputText()}
      <div>
        <button
          type="button"
          onClick={onSubmitAnswer}
          className="p-4 text-2xl text-black bg-blue-400 rounded-sm"
        >
          {question === GuessingGameQuestion.CORRECT_ENDING
            ? 'Show me my guesses'
            : 'Submit'}
        </button>
      </div>
    </div>
  );
}
