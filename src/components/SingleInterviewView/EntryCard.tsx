import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Element as ScrollableElement } from 'react-scroll';
import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import useInterviewStore from '../../hooks/useInterviewStore';

type Props = {
  entry: InterviewScreenEntry.T | InterviewScreenEntry.CreateT;
  onEntryChange: (
    entry: InterviewScreenEntry.T | InterviewScreenEntry.CreateT,
  ) => void;
};

const ENTRY_RESPONSE_TYPE_OPTIONS = InterviewScreenEntry.RESPONSE_TYPES.map(
  responsType => ({
    displayValue: InterviewScreenEntry.getResponseTypeDisplayName(responsType),
    value: responsType,
  }),
);

function EntryCard(
  { entry, onEntryChange }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const interviewStore = useInterviewStore();

  const onDeleteClick = (): void => {
    interviewStore.removeEntryFromScreen(entry).then(value => {
      // eslint-disable-next-line no-console
      console.log(`handled on delete value = ${value}`);
    });
  };

  return (
    <ScrollableElement
      name={entry.id}
      className="relative flex w-full flex-row border border-gray-200 bg-white p-10 shadow-lg"
      key={entry.id}
    >
      <div className="absolute top-0 right-0 pr-4 pt-4">
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 cursor-pointer text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
          onClick={onDeleteClick}
        />
      </div>
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon
          className="h-6 w-6 pr-4"
          icon={IconType.faCircleQuestion}
        />
        {entry.name}
      </div>
      <Form ref={forwardedRef} className="w-full pr-12">
        <Form.Group label="Prompt">
          <Form.Input
            label="Text"
            name="prompt"
            value={entry.prompt}
            onChange={(newVal: string) => {
              onEntryChange({
                ...entry,
                prompt: newVal,
              });
            }}
          />
          <Form.Input
            label="Helper Text"
            name="text"
            required={false}
            value={entry.text}
            onChange={(newVal: string) => {
              onEntryChange({
                ...entry,
                // TODO: change this to be named `helperText` instead of just `text`
                text: newVal,
              });
            }}
          />
        </Form.Group>
        <Form.Group label="Response">
          <Form.Input
            disabled
            label="ID"
            name="responseId"
            defaultValue={entry.responseId}
          />
          <Form.Dropdown
            label="Type"
            name="responseType"
            options={ENTRY_RESPONSE_TYPE_OPTIONS}
            value={entry.responseType}
            onChange={(newVal: InterviewScreenEntry.ResponseType) => {
              onEntryChange({
                ...entry,
                responseType: newVal,
              });
            }}
          />
        </Form.Group>
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(EntryCard);
