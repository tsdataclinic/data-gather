import * as React from 'react';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Element as ScrollableElement } from 'react-scroll';
import Form from '../ui/Form';
import Button from '../ui/Button';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import useInterviewStore from '../../hooks/useInterviewStore';

type Props = {
  entry: InterviewScreenEntry.T;
};

function EntryCard(
  { entry }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const [displayedEntry, setDisplayedEntry] =
    React.useState<InterviewScreenEntry.T>(entry);
  const interviewStore = useInterviewStore();

  const onSaveSubmit = (values: Map<string, string>): void => {
    const newEntry = {
      ...entry,
      prompt: values.get('prompt') ?? '',
      responseType: values.get('responseType') ?? '',
      text: values.get('text') ?? '',
    };

    interviewStore.putScreenEntry(newEntry);
    setDisplayedEntry(newEntry);
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
      className="flex w-full flex-row border border-gray-200 bg-white p-10 shadow-lg"
      key={entry.id}
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faCircleQuestion} />
        {entry.name}
      </div>
      <Form ref={forwardedRef} onSubmit={onSaveSubmit}>
        <Form.Group label="Prompt">
          <Form.Input
            label="Text"
            name="prompt"
            defaultValue={displayedEntry.prompt}
          />
          <Form.Input
            label="Helper Text"
            name="text"
            defaultValue={displayedEntry.text}
          />
        </Form.Group>
        <Form.Group label="Response">
          <Form.Input
            disabled
            label="ID"
            name="responseId"
            defaultValue={displayedEntry.responseId}
          />
          <Form.Dropdown
            label="Type"
            name="responseType"
            options={[
              { displayValue: 'Text', value: 'text' },
              { displayValue: 'Number', value: 'number' },
            ]}
            defaultValue={displayedEntry.responseType}
          />
          <Form.SubmitButton>Save</Form.SubmitButton>
        </Form.Group>
        <div className="flex space-x-4">
          <Button intent="danger" onClick={handleOnDelete}>
            Delete
          </Button>
        </div>
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(EntryCard);
