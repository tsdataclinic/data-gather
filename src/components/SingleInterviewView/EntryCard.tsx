import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Element as ScrollableElement } from 'react-scroll';
import Form from '../ui/Form';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import useAppState from '../../hooks/useAppState';
import MultiSelect from '../ui/MultiSelect';

export type EditableEntry =
  | InterviewScreenEntry.T
  | InterviewScreenEntry.CreateT;

type Props = {
  entry: EditableEntry;
  onEntryChange: (
    entryToReplace: EditableEntry,
    newEntry: EditableEntry,
  ) => void;
  onEntryDelete: (entryToDelete: EditableEntry) => void;
};

const ENTRY_RESPONSE_TYPE_OPTIONS = InterviewScreenEntry.RESPONSE_TYPES.map(
  responsType => ({
    displayValue: InterviewScreenEntry.getResponseTypeDisplayName(responsType),
    value: responsType,
  }),
);

function EntryCard(
  { entry, onEntryChange, onEntryDelete }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const [selectedBase, setSelectedBase] = React.useState<string>(
    entry.responseTypeOptions.selectedBase ?? '',
  );
  const [selectedTable, setSelectedTable] = React.useState<string>(
    entry.responseTypeOptions.selectedTable ?? '',
  );
  const [selectedField, setSelectedField] = React.useState<string[]>(
    entry.responseTypeOptions.selectedFields ?? [],
  );
  const { airtableSettings: hardCodedSettings } = useAppState();
  const { bases } = hardCodedSettings;
  const [availableTables, setAvailableTables] = React.useState<
    ReadonlyArray<{
      displayValue: string;
      value: string;
    }>
  >([]);
  const [availableFields, setAvailableFields] = React.useState<
    ReadonlyArray<{
      displayValue: string;
      value: string;
    }>
  >([]);

  React.useEffect(() => {
    if (bases && selectedBase) {
      const output = bases
        .find(b => b.name === selectedBase)
        ?.tables.map(t => ({
          displayValue: t.name,
          value: t.key,
        }));
      if (output) {
        setAvailableTables(output);
      }
    } else {
      setAvailableTables([]);
    }
  }, [bases, selectedBase]);

  React.useEffect(() => {
    if (bases && selectedBase && selectedTable) {
      const output = bases
        .find(b => b.name === selectedBase)
        ?.tables.find(b => b.key === selectedTable)
        ?.fields.map(f => ({
          displayValue: f.fieldName,
          value: f.fieldName,
        }));
      if (output) {
        setAvailableFields(output);
      }
    } else {
      setAvailableFields([]);
    }
  }, [bases, selectedBase, selectedTable]);

  const entryId = 'id' in entry ? entry.id : entry.tempId;

  return (
    <ScrollableElement
      name={entryId}
      key={entryId}
      className="relative flex w-full flex-row border border-gray-200 bg-white p-10 shadow-lg"
    >
      <div className="absolute top-0 right-0 pr-4 pt-4">
        <FontAwesomeIcon
          aria-label="Delete"
          className="h-5 w-5 cursor-pointer text-slate-400 transition-colors duration-200 hover:text-red-500"
          icon={IconType.faX}
          onClick={() => onEntryDelete(entry)}
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
              onEntryChange(entry, {
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
              onEntryChange(entry, {
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
            name="responseKey"
            defaultValue={entry.responseKey}
          />
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
            <>
              <Form.Dropdown
                label="Airtable base"
                name="airtableBase"
                value={selectedBase}
                onChange={(newVal: string) => {
                  setSelectedBase(newVal);
                  onEntryChange(entry, {
                    ...entry,
                    responseTypeOptions: {
                      ...entry.responseTypeOptions,
                      selectedBase: newVal,
                    },
                  });
                }}
                options={bases.map(b => ({
                  displayValue: b.name,
                  value: b.name,
                }))}
              />
              {selectedBase && (
                <Form.Dropdown
                  label="Airtable table"
                  name="airtableTable"
                  placeholder="Airtable table"
                  value={selectedTable}
                  onChange={(newVal: string) => {
                    setSelectedTable(newVal);
                    onEntryChange(entry, {
                      ...entry,
                      responseTypeOptions: {
                        ...entry.responseTypeOptions,
                        selectedTable: newVal,
                      },
                    });
                  }}
                  options={availableTables}
                />
              )}
              {selectedBase && selectedTable && (
                <MultiSelect
                  ariaLabel="Airtable field"
                  onChange={(newVals: string[]) => {
                    setSelectedField(newVals);
                    onEntryChange(entry, {
                      ...entry,
                      responseTypeOptions: {
                        ...entry.responseTypeOptions,
                        selectedFields: newVals,
                      },
                    });
                  }}
                  options={availableFields}
                  placeholder="Airtable field"
                  selectedValues={selectedField}
                />
              )}
            </>
          )}
        </Form.Group>
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(EntryCard);
