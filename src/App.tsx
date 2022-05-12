import { KeyboardEvent, ChangeEvent } from 'react';
import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { GuessingGameQuestion } from './GuessingGameQuestion';
import useInterview from './hooks/useInterview';

export default function App() {
  const [responseText, setResponseText] = useState('');
  const { question, responseData, submitAnswer, isInterviewComplete } =
    useInterview();

  const onTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setResponseText(val);
  };

  const resetText = () => setResponseText('');

  const onSubmitAnswer = () => {
    // If we aren't at the last page then don't allow an empty response
    if (
      question !== GuessingGameQuestion.CORRECT_ENDING &&
      responseText === ''
    ) {
      return;
    }

    resetText();
    switch (question) {
      case GuessingGameQuestion.NAME:
        return submitAnswer({ name: responseText.trim() });
      case GuessingGameQuestion.GUESS:
      case GuessingGameQuestion.INCORRECT_GUESS:
        return submitAnswer({
          numbersGuessed: [
            Number(responseText),
            ...(responseData.numbersGuessed || []),
          ],
        });
      case GuessingGameQuestion.CORRECT_ENDING:
        return submitAnswer();
    }
  };

  const renderQuestion = (question: GuessingGameQuestion | undefined) => {
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
    }
  };

  const renderInputText = (question: GuessingGameQuestion | undefined) => {
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
        style={{ fontSize: '2rem', padding: '0.5rem' }}
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

  const renderInterviewPage = () => {
    if (isInterviewComplete) {
      return (
        <>
          <p>Congratulations {responseData.name}!</p>
          <p>
            Your guesses were {responseData.numbersGuessed.reverse().join(', ')}
          </p>
        </>
      );
    }

    return (
      <>
        <p>{renderQuestion(question)}</p>
        {renderInputText(question)}
        <button
          type="button"
          onClick={onSubmitAnswer}
          style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.5rem' }}
        >
          {question === GuessingGameQuestion.CORRECT_ENDING
            ? 'Show me my guesses'
            : 'Submit'}
        </button>
      </>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {renderInterviewPage()}
      </header>
    </div>
  );
}
