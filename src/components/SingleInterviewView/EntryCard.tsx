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
      className="flex flex-row p-5 w-full bg-white shadow-md"
      key={entry.id}
    >
      <div className="flex flex-row w-1/6">
        <FontAwesomeIcon className="pr-4 w-6 h-6" icon={faCircleQuestion} />
        {entry.name}
      </div>
      <form className="flex flex-col gap-4" onSubmit={() => handleSubmit}>
        <div className="flex flex-row divide-x-2">
          <div className="pr-4 w-40 text-right">Prompt</div>
          <div className="pl-4">
            <div className="pb-2">
              <label htmlFor="fname">Text</label>
              <input
                className="p-1 ml-4 rounded-lg border-2 border-solid"
                type="text"
                value={entry.prompt}
                width={50}
                name="fname"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Helper Text</label>
              <input
                className="p-1 ml-4 rounded-lg border-2 border-solid"
                type="text"
                value={entry.text}
                width={50}
                name="fname"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row divide-x-2">
          <div className="pr-4 w-40 text-right">Response</div>
          <div className="pl-4">
            <div className="pb-2">
              <label htmlFor="fname">ID</label>
              <input
                className="p-1 ml-4 rounded-lg border-2 border-solid"
                type="text"
                value={entry.responseId}
                width={50}
                name="fname"
              />
            </div>
            <div className="pt-2">
              <label htmlFor="fname">Type</label>
              <input
                className="p-1 ml-4 rounded-lg border-2 border-solid"
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
