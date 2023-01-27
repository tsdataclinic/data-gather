import * as React from 'react';
import { useCallback } from 'react';
import { ResponseConsumer } from '@dataclinic/interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Form from '../ui/Form';
import InterviewRunnerEntry from './InterviewRunnerEntry';
import type { ResponseData } from '../../script/types';

type Props = {
  entries: InterviewScreenEntry.T[];
  responseConsumer: ResponseConsumer;
  screen: InterviewScreen.T;
};

export default function InterviewRunnerScreen({
  screen,
  entries,
  responseConsumer,
}: Props): JSX.Element {
  const entriesMap = React.useMemo(
    () =>
      entries.reduce(
        (map, entry) => map.set(entry.responseKey, entry),
        new Map<string, InterviewScreenEntry.T>(),
      ),
    [entries],
  );

  const handleSubmit = useCallback(
    (formData: Map<string, string>) => {
      if (!responseConsumer) {
        return;
      }
      const formResponses: ResponseData = {};

      formData.forEach((value, key) => {
        const entry = entriesMap.get(key);
        if (entry) {
          formResponses[key] = {
            entry,
            response:
              entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
                ? JSON.parse(value)
                : value,
          };
        }
      });
      responseConsumer.answer(formResponses);
      responseConsumer.submit();
    },
    [responseConsumer, entriesMap],
  );

  return (
    <div className="mx-auto mt-8 w-4/6">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-2xl">{screen.title}</h1>
        {screen.headerText && <h3 className="text-xl">{screen.headerText}</h3>}
      </div>
      <Form onSubmit={handleSubmit}>
        {entries.map((entry: InterviewScreenEntry.T) => (
          <InterviewRunnerEntry key={entry.id} entry={entry} />
        ))}
        <Form.SubmitButton />
      </Form>
    </div>
  );
}
