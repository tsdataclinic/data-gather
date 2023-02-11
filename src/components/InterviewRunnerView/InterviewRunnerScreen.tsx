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
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

type Props = {
  entries: InterviewScreenEntry.T[];
  interview: Interview.T;
  onInterviewReset: () => void;
  responseConsumer: ResponseConsumer;
  screen: InterviewScreen.T;
};

export default function InterviewRunnerScreen({
  interview,
  screen,
  entries,
  responseConsumer,
  onInterviewReset,
}: Props): JSX.Element {
  const { allowedLanguages, defaultLanguage } = interview;
  const [selectedLanguage, setSelectedLanguage] =
    React.useState(defaultLanguage);
  const toaster = useToast();

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

      // check if any form is an airtable lookup and is missing data
      const invalidAirtableSelection = [...formData.entries()].some(
        ([key, value]) => {
          const entry = entriesMap.get(key);
          if (!entry) {
            return true;
          }

          if (
            entry.responseType === InterviewScreenEntry.ResponseType.AIRTABLE
          ) {
            return value === undefined || value === '';
          }
          return false;
        },
      );

      if (invalidAirtableSelection) {
        toaster.notifyError(
          'Missing selection',
          'You need to make a selection in the table before you can move forward',
        );
        return;
      }

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
    [responseConsumer, entriesMap, toaster],
  );

  return (
    <div className="mx-auto space-y-4 bg-white pb-8 sm:mt-8 sm:w-4/6 sm:border sm:border-blue-300 sm:shadow-md">
      <div className="relative w-full space-y-4 bg-blue-600 px-8 py-4 text-center">
        {allowedLanguages.length > 1 ? (
          <div className="absolute top-2 right-2 text-sm sm:right-auto sm:left-8">
            <LabelWrapper
              labelTextClassName="text-white hidden sm:inline"
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
      <Form className="px-5 sm:px-8" onSubmit={handleSubmit}>
        {entries.map((entry: InterviewScreenEntry.T) => (
          <InterviewRunnerEntry
            selectedLanguage={selectedLanguage}
            defaultLanguage={defaultLanguage}
            key={entry.id}
            entry={entry}
          />
        ))}
        <div className="flex justify-between">
          <Form.SubmitButton />
          <Button
            className="text-blue-800 underline underline-offset-4 transition-colors hover:text-blue-400"
            onClick={onInterviewReset}
            unstyled
          >
            Restart Interview
          </Button>
        </div>
      </Form>
    </div>
  );
}
