import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Scroll from 'react-scroll';
import { MixedCheckbox } from '@reach/checkbox';
import Form from '../../ui/Form';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import AirtableFieldSelector from './AirtableFieldSelector';
import EditableName from './EditableName';
import type { EditableEntry } from '../types';
import Button from '../../ui/Button';
import LabelWrapper from '../../ui/LabelWrapper';

type Props = {
  entry: EditableEntry;
  onEntryChange: (
    entryToReplace: EditableEntry,
    newEntry: EditableEntry,
  ) => void;
  onEntryDelete: (entryToDelete: EditableEntry) => void;

  /** Should we scroll to this card when it mounts? */
  scrollOnMount: boolean;
};

const ENTRY_RESPONSE_TYPE_OPTIONS = InterviewScreenEntry.RESPONSE_TYPES.map(
  responsType => ({
    displayValue: InterviewScreenEntry.getResponseTypeDisplayName(responsType),
    value: responsType,
  }),
);

function EntryCard(
  { entry, onEntryChange, onEntryDelete, scrollOnMount }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const entryId = 'id' in entry ? entry.id : entry.tempId;

  const onNameChange = (newName: string): void => {
    onEntryChange(entry, { ...entry, name: newName });
  };

  // on mount, scroll to this component
  React.useEffect(() => {
    if (scrollOnMount) {
      Scroll.scroller.scrollTo(entryId, {
        containerId: 'scrollContainer',
        smooth: true,
      });
    }
  }, [entryId, scrollOnMount]);

  return (
    <Scroll.Element
      name={entryId}
      key={entryId}
      className="relative flex w-full flex-row border border-gray-200 bg-white p-10 shadow-lg"
    >
      <Button
        unstyled
        className="absolute top-4 right-4"
        onClick={() => onEntryDelete(entry)}
      >
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
        />
      </Button>
      <div className="flex w-1/6">
        <EditableName onNameChange={onNameChange} name={entry.name} />
      </div>
      <Form ref={forwardedRef} className="w-full pl-6 pr-12">
        <Form.Group label="Prompt">
          <Form.Input
            label="Text"
            name="prompt"
            infoTooltip="This is the main prompt the user will see"
            value={entry.prompt.en} // TODO UI should support multiple language prompts rather than hardcoding english
            onChange={(newVal: string) => {
              onEntryChange(entry, {
                ...entry,
                prompt: { en: newVal }, // TODO UI should support multiple language prompts rather than hardcoding english
              });
            }}
          />
          <Form.Input
            label="Helper Text"
            name="text"
            infoTooltip="This is more text that will be displayed if you want to give more details about the question."
            required={false}
            value={entry.text.en} // TODO UI should support multiple language prompts rather than hardcoding english
            onChange={(newVal: string) => {
              onEntryChange(entry, {
                ...entry,
                // TODO: change this to be named `helperText` instead of just `text`
                // TODO UI should support multiple language prompts rather than hardcoding english
                text: { en: newVal },
              });
            }}
          />
        </Form.Group>
        <Form.Group label="Response">
          <Form.Dropdown
            label="Type"
            name="responseType"
            options={ENTRY_RESPONSE_TYPE_OPTIONS}
            value={entry.responseType}
            onChange={(newVal: InterviewScreenEntry.ResponseType) => {
              onEntryChange(entry, {
                ...entry,
                responseType: newVal,
              });
            }}
          />
          {entry.responseType ===
            InterviewScreenEntry.ResponseType.AIRTABLE && (
            <AirtableFieldSelector
              fieldSelectorLabel="Fields to search by"
              airtableConfig={entry.responseTypeOptions}
              onAirtableConfigurationChange={(
                newConfig: InterviewScreenEntry.ResponseTypeOptions,
              ) => {
                onEntryChange(entry, {
                  ...entry,
                  responseTypeOptions: newConfig,
                });
              }}
            />
          )}
          <LabelWrapper
            inline
            label="Required"
            labelTextClassName="w-20"
            inlineContainerStyles={{ verticalAlign: 'text-top' }}
          >
            <MixedCheckbox
              onChange={e => {
                onEntryChange(entry, { ...entry, required: e.target.checked });
              }}
              checked={entry.required}
            />
          </LabelWrapper>
        </Form.Group>
      </Form>
    </Scroll.Element>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(EntryCard);
