import * as React from 'react';
import { useCallback } from 'react';
import { ResponseConsumer, ResponseData } from '@dataclinic/interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Form from '../ui/Form';

type Props = {
  entries: Map<string, InterviewScreenEntry.T[]>;
  responseConsumer: ResponseConsumer;
  responseData: ResponseData;
  screen: InterviewScreen.T;
};

export default function InterviewRunnerScreen({
  screen,
  entries,
  responseConsumer,
}: Props): JSX.Element {
  const handleSubmit = useCallback(
    (formData: Map<string, string>) => {
      if (!responseConsumer) {
        return;
      }
      responseConsumer.answer(Object.fromEntries(formData));
      responseConsumer.submit();
    },
    [responseConsumer],
  );

  return (
    <div className="mx-auto mt-8 w-4/6">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-2xl">{screen.title}</h1>
        {screen.headerText && <h3 className="text-xl">{screen.headerText}</h3>}
      </div>
      <Form onSubmit={handleSubmit}>
        {entries.get(screen.id)?.map((entry: InterviewScreenEntry.T) => {
          switch (entry.responseType) {
            case 'text':
              return (
                <Form.Input
                  key={entry.id}
                  name={entry.responseId}
                  label={entry.prompt}
                />
              );
            case 'boolean':
              return (
                <Form.Input
                  type="radio"
                  name={entry.responseId}
                  label={entry.prompt}
                  options={[
                    { value: true, displayValue: 'Yes' },
                    { value: false, displayValue: 'No' },
                  ]}
                />
              );
            case 'number':
              return (
                <Form.Input
                  type="number"
                  key={entry.id}
                  name={entry.responseId}
                  label={entry.prompt}
                />
              );
            default:
              return (
                <div>
                  <em>
                    Response type &quot;{entry.responseType}&quot; not
                    implemented.
                  </em>
                </div>
              );
          }
        })}
        <Form.SubmitButton />
      </Form>
    </div>
  );
}
