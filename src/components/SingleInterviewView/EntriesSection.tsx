import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as R from 'remeda';
import { Reorder } from 'framer-motion';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import * as Interview from '../../models/Interview';
import Button from '../ui/Button';
import EntryCard from './EntryCard';
import type { EditableEntry } from './types';
import useRefMap from '../../hooks/useRefMap';
import InfoIcon from '../ui/InfoIcon';

type Props = {
  entries: readonly EditableEntry[];
  interview: Interview.WithScreensAndActions;
  onEntryChange: (
    entryToReplace: EditableEntry,
    newEntry: EditableEntry,
  ) => void;
  onEntryDelete: (entryToDelete: EditableEntry) => void;
  onEntryOrderChange: (newEntries: readonly EditableEntry[]) => void;
  onNewEntryClick: () => void;
};

type EntriesSectionAPI = {
  getForms: () => HTMLFormElement[];
};

function BaseEntriesSection(
  {
    entries,
    onEntryChange,
    onEntryDelete,
    onNewEntryClick,
    onEntryOrderChange,
    interview,
  }: Props,
  forwardedRef: React.ForwardedRef<EntriesSectionAPI>,
): JSX.Element {
  const entryIds = React.useMemo(
    () => entries.map(entry => InterviewScreenEntry.getId(entry)),
    [entries],
  );

  const formRefs = useRefMap<HTMLFormElement | null>(entryIds, null);

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      getForms: () =>
        R.pipe(
          [...formRefs.values()],
          R.map(formRef => formRef.current),
          R.compact,
        ),
    }),
    [formRefs],
  );

  if (entries.length === 0) {
    return (
      <div className="relative flex w-full flex-col items-center space-y-4 border border-gray-200 bg-white p-10 shadow-lg">
        <p>No questions have been added yet.</p>
        <Button intent="primary" onClick={onNewEntryClick}>
          Add your first question
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col items-center space-y-6 border border-gray-200 bg-white px-10 pt-6 pb-10 shadow-lg">
      <div className="flex items-center self-start">
        <FontAwesomeIcon
          className="h-6 w-6 pr-4"
          icon={IconType.faCircleQuestion}
        />
        <h2 className="mr-2 text-xl tracking-wide">Questions</h2>
        <InfoIcon tooltip="These are the questions that will be displayed to the user" />
      </div>

      <Reorder.Group
        axis="y"
        className="w-full space-y-6"
        values={entries as EditableEntry[]}
        onReorder={onEntryOrderChange}
      >
        {entries.map(entry => {
          const entryId = InterviewScreenEntry.getId(entry);
          return (
            <Reorder.Item key={entryId} value={entry}>
              <EntryCard
                ref={formRefs.get(entryId)}
                entry={entry}
                onEntryChange={onEntryChange}
                onEntryDelete={onEntryDelete}
                scrollOnMount={InterviewScreenEntry.isCreateType(entry)}
                interview={interview}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}

const EntriesSection = React.forwardRef(BaseEntriesSection);
export default EntriesSection;
