import * as React from 'react';
import { useCallback } from 'react';
import { ResponseConsumer } from '@dataclinic/interview';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import Form from '../ui/Form';
import InterviewRunnerEntry from './InterviewRunnerEntry';
import type { ResponseData } from '../../script/types';
import Dropdown from '../ui/Dropdown';
import * as Config from '../../config';
import LabelWrapper from '../ui/LabelWrapper';

type Props = {
  entries: InterviewScreenEntry.T[];
  interview: Interview.T;
  responseConsumer: ResponseConsumer;
  screen: InterviewScreen.T;
};

export default function InterviewRunnerScreen({
  interview,
  screen,
  entries,
  responseConsumer,
}: Props): JSX.Element {
  const { allowedLanguages, defaultLanguage } = interview;
  const [selectedLanguage, setSelectedLanguage] =
    React.useState(defaultLanguage);

  const languageOptions = React.useMemo(
    () =>
      allowedLanguages.map(languageCode => ({
        displayValue: Config.LANGUAGES[languageCode],
        value: languageCode,
      })),
    [allowedLanguages],
  );

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
    <div className="mx-auto mt-8 w-4/6 space-y-4 border border-blue-300 bg-white pb-8 shadow-md">
      <div className="relative w-full space-y-4 bg-blue-600 px-8 py-4 text-center">
        {allowedLanguages.length > 1 ? (
          <div className="absolute top-2 left-8">
            <LabelWrapper
              labelTextClassName="text-white"
              label="Language"
              inline
            >
              <Dropdown
                className="!bg-blue-800 !p-2 !py-1 !text-blue-50 !shadow-none hover:!bg-blue-900 hover:!text-white"
                options={languageOptions}
                onChange={setSelectedLanguage}
                value={selectedLanguage}
              />
            </LabelWrapper>
          </div>
        ) : null}

        <h1 className="text-2xl tracking-wide text-white">
          {InterviewScreen.getTitle(screen, selectedLanguage, defaultLanguage)}
        </h1>
        {screen.headerText && (
          <p className="text-lg text-blue-100">
            {screen.headerText[selectedLanguage] ||
              screen.headerText[defaultLanguage]}
          </p>
        )}
      </div>
      <Form className="px-8" onSubmit={handleSubmit}>
        {entries.map((entry: InterviewScreenEntry.T) => (
          <InterviewRunnerEntry
            selectedLanguage={selectedLanguage}
            defaultLanguage={defaultLanguage}
            key={entry.id}
            entry={entry}
          />
        ))}
        <Form.SubmitButton />
      </Form>
    </div>
  );
}
