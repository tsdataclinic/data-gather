import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FormEvent, useState } from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import './EntryCard.css';
import useInterviewStore from '../../hooks/useInterviewStore';

type Props = {
  entry: InterviewScreenEntry.T;
};

export default function EntryCard({ entry }: Props): JSX.Element {
  const [displayedEntry, setDisplayedEntry] =
    useState<InterviewScreenEntry.T>(entry);
  const interviewStore = useInterviewStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formElements = event.currentTarget.elements;

    const newEntry: InterviewScreenEntry.T = {
      screenId: entry.screenId,
      id: entry.id,
      name: entry.name,
      prompt: (formElements.namedItem('prompt') as HTMLInputElement).value,
      text: (formElements.namedItem('text') as HTMLInputElement).value,
      responseId: (formElements.namedItem('responseId') as HTMLInputElement)
        .value,
      responseType: (formElements.namedItem('responseType') as HTMLInputElement)
        .value,
    };

    interviewStore.putScreenEntry(newEntry).then(setDisplayedEntry);
  };

  const handleOnDelete = (): void => {
    interviewStore.removeEntryFromScreen(entry).then(value => {
      // eslint-disable-next-line no-console
      console.log(`handled on delete value = ${value}`);
    });
  };

  return (
    <ScrollableElement
      name={entry.id}
      className="flex w-full flex-row bg-white p-10 shadow-md"
      key={entry.id}
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faCircleQuestion} />
        {entry.name}
      </div>
      <form
        id={entry.id}
        className="flex w-full flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-row divide-x-2">
          <div className="w-40 pr-4 text-right">Prompt</div>
          <div className="w-full pl-4">
            <div className="w-full pb-2">
              <label htmlFor="fname">Text</label>
              <input
                type="text"
                defaultValue={displayedEntry.prompt}
                width={50}
                name="prompt"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Helper Text</label>
              <input
                type="text"
                defaultValue={displayedEntry.text}
                width={50}
                name="text"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row divide-x-2">
          <div className="w-40 pr-4 text-right">Response</div>
          <div className="w-full pl-4">
            <div className="w-full pb-2">
              <label htmlFor="fname">ID</label>
              <input
                type="text"
                defaultValue={displayedEntry.responseId}
                width={50}
                name="responseId"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Type</label>
              <input
                type="text"
                defaultValue={displayedEntry.responseType}
                width={50}
                name="responseType"
              />
            </div>
          </div>
        </div>
        <input type="submit" value="Save" />
        <button type="submit" className="bg-red-300" onClick={handleOnDelete}>
          {' '}
          Delete{' '}
        </button>
      </form>
    </ScrollableElement>
  );
}
