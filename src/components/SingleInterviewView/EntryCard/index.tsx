import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Scroll from 'react-scroll';
import { MixedCheckbox } from '@reach/checkbox';
import Form from '../../ui/Form';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import EditableName from './EditableName';
import type { EditableEntry } from '../types';
import Button from '../../ui/Button';
import LabelWrapper from '../../ui/LabelWrapper';
import ResponseTypeConfigBlock from './ResponseTypeConfigBlock';
import SelectedLanguageContext from '../SelectedLanguageContext';

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
  const selectedLanguageCode = React.useContext(SelectedLanguageContext);
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
      className="relative flex w-full flex-row rounded border border-gray-300 bg-gray-50 p-6 text-slate-800"
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
            value={entry.prompt[selectedLanguageCode] ?? ''}
            onChange={(newVal: string) => {
              onEntryChange(entry, {
                ...entry,
                prompt: { ...entry.prompt, [selectedLanguageCode]: newVal },
              });
            }}
          />
          <Form.Input
            label="Helper text"
            name="text"
            infoTooltip="This is more text that will be displayed if you want to give more details about the question."
            required={false}
            value={entry.text[selectedLanguageCode] ?? ''}
            onChange={(newVal: string) => {
              onEntryChange(entry, {
                ...entry,
                // TODO: change this to be named `helperText` instead of just `text`
                text: { ...entry.text, [selectedLanguageCode]: newVal },
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
            onChange={(newResponseType: InterviewScreenEntry.ResponseType) => {
              onEntryChange(
                entry,
                InterviewScreenEntry.changeResponseType(entry, newResponseType),
              );
            }}
          />
          <ResponseTypeConfigBlock
            entry={entry}
            onEntryChange={onEntryChange}
          />
          <LabelWrapper
            inline
            label="Required"
            infoTooltip="Use this if this question cannot be left empty"
            labelTextClassName="mr-1"
            inlineContainerStyles={{ position: 'relative', top: 1 }}
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
