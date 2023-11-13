import invariant from 'invariant';
import Button from '../ui/Button';
import type { ResponseData } from '../../script/types';
import * as Interview from '../../models/Interview';
import assertUnreachable from '../../util/assertUnreachable';

type Props = {
  error?: { errorMessage: string; errorTitle: string };
  interview: Interview.WithScreensAndActions;
  isUpdatingBackend: boolean;
  onStartNewInterview: () => void;
  responseData: ResponseData;
};

export default function InterviewCompletionScreen({
  error,
  onStartNewInterview,
  isUpdatingBackend,
  responseData,
  interview,
}: Props): JSX.Element {
  const { defaultLanguage } = interview;

  function renderContent(): JSX.Element {
    if (isUpdatingBackend) {
      return <h1 className="text-2xl">Saving responses...</h1>;
    }

    if (error) {
      const responseDetailRows = Object.values(responseData).map(
        ({ entry, response }) => {
          const prompt = entry.prompt[defaultLanguage];

          switch (entry.responseType) {
            case 'airtable':
              invariant(
                typeof response === 'object',
                'Airtable response type should be an object',
              );
              return (
                <div key={entry.id}>
                  <div>
                    <strong>{prompt}</strong>
                  </div>
                  <div className="ml-2">
                    {Object.entries(response).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'text':
            case 'number':
            case 'boolean':
            case 'email':
            case 'phone_number':
            case 'single_select':
              return (
                <div key={entry.id}>
                  <strong>{prompt}</strong> {String(response)}
                </div>
              );
            default:
              return assertUnreachable(entry);
          }
        },
      );

      return (
        <>
          <h1 className="text-2xl text-red-700">Error!</h1>
          <div className="space-y-1 rounded bg-red-100 p-3">
            <h3 className="text-sm uppercase text-slate-700">Error details</h3>
            <p>{error.errorTitle}</p>
            <p>{error.errorMessage}</p>
          </div>
          <div className="max-w-full space-y-2 bg-blue-100 py-2 px-3">
            <p>The following information did not get logged:</p>
            <div className="space-y-1 break-words">{responseDetailRows}</div>
          </div>
        </>
      );
    }
    return <h1 className="text-2xl">Done!</h1>;
  }

  return (
    <div className="m-16 flex flex-col items-center space-y-8">
      {renderContent()}
      <Button onClick={onStartNewInterview} intent="primary">
        Start a new interview
      </Button>
    </div>
  );
}
