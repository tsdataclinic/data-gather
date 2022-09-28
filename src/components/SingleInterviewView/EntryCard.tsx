import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

interface Props {
  entry: InterviewScreenEntry.T;
}
function EntryCard({ entry }: Props): JSX.Element {
  const handleSubmit = (): void => {
    // eslint-disable-next-line no-console
    console.log('submitted');
  };

  return (
    <ScrollableElement
      name={entry.id}
      className="flex w-full flex-row bg-white p-5 shadow-md"
      key={entry.id}
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faCircleQuestion} />
        {entry.name}
      </div>
      <form className="flex flex-col gap-4" onSubmit={() => handleSubmit}>
        <div className="flex flex-row divide-x-2">
          <div className="w-40 pr-4 text-right">Prompt</div>
          <div className="pl-4">
            <div className="pb-2">
              <label htmlFor="fname">Text</label>
              <input
                className="ml-4 rounded-lg border-2 border-solid p-1"
                type="text"
                value={entry.prompt}
                width={50}
                name="fname"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Helper Text</label>
              <input
                className="ml-4 rounded-lg border-2 border-solid p-1"
                type="text"
                value={entry.text}
                width={50}
                name="fname"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row divide-x-2">
          <div className="w-40 pr-4 text-right">Response</div>
          <div className="pl-4">
            <div className="pb-2">
              <label htmlFor="fname">ID</label>
              <input
                className="ml-4 rounded-lg border-2 border-solid p-1"
                type="text"
                value={entry.responseId}
                width={50}
                name="fname"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Type</label>
              <input
                className="ml-4 rounded-lg border-2 border-solid p-1"
                type="text"
                value={entry.responseType}
                width={50}
                name="fname"
              />
            </div>
          </div>
        </div>
        <input type="submit" value="Save" />
      </form>
    </ScrollableElement>
  );
}

export default EntryCard;
