import * as React from 'react';
import { useCallback } from 'react';
import { ResponseConsumer, ResponseData } from '@dataclinic/interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Form from '../ui/Form';
import InterviewRunnerEntry from './InterviewRunnerEntry';

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
        {entries.get(screen.id)?.map((entry: InterviewScreenEntry.T) => (
          <InterviewRunnerEntry key={entry.id} entry={entry} />
        ))}
        <Form.SubmitButton />
      </Form>
    </div>
  );
}
