import * as React from 'react';
import Form from '../../ui/Form';
import LabelWrapper from '../../ui/LabelWrapper';
import MultiSelect from '../../ui/MultiSelect';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import useAppState from '../../../hooks/useAppState';
import type { AirtableField } from '../../../store/appReducer';

type Props = {
  airtableConfig: InterviewScreenEntry.AirtableOptions;
  fieldFilterFn?: (airtableField: AirtableField) => boolean;
  fieldSelectorLabel?: string;
  onAirtableConfigurationChange: (
    newConfig: InterviewScreenEntry.AirtableOptions,
  ) => void;
  useSingleField?: boolean;
};

export default function AirtableFieldSelector({
  airtableConfig,
  onAirtableConfigurationChange,
  fieldSelectorLabel = 'Select field',
  useSingleField = false,
  fieldFilterFn,
}: Props): JSX.Element {
  const { airtableSettings } = useAppState();
  const { bases } = airtableSettings;
  const { selectedBase, selectedTable, selectedFields } = airtableConfig;

  const availableTables = React.useMemo(() => {
    if (bases && selectedBase) {
      const tables = bases
        .find(b => b.name === selectedBase)
        ?.tables.map(t => ({
          displayValue: t.name,
          value: t.key,
        }));

      if (tables) {
        return tables;
      }
    }
    return [];
  }, [bases, selectedBase]);

  const availableFields = React.useMemo(() => {
    if (bases && selectedBase && selectedTable) {
      const fields = bases
        .find(b => b.name === selectedBase)
        ?.tables.find(b => b.key === selectedTable)
        ?.fields.filter(field => (fieldFilterFn ? fieldFilterFn(field) : true))
        .map(f => ({
          displayValue: f.fieldName,
          value: f.fieldName,
        }));
      if (fields) {
        return fields;
      }
    }
    return [];
  }, [bases, selectedBase, selectedTable, fieldFilterFn]);

  const renderFieldSelector = (): JSX.Element | null => {
    if (selectedBase && selectedTable) {
      if (useSingleField) {
        return (
          <Form.Dropdown
            label={fieldSelectorLabel}
            placeholder="Airtable field"
            name="airtableField"
            value={selectedFields[0]}
            onChange={(field: string) => {
              onAirtableConfigurationChange({
                ...airtableConfig,
                selectedFields: [field],
              });
            }}
            options={availableFields}
          />
        );
      }
      return (
        <LabelWrapper label={fieldSelectorLabel}>
          <MultiSelect
            ariaLabel="Airtable field"
            onChange={(newVals: string[]) => {
              onAirtableConfigurationChange({
                ...airtableConfig,
                selectedFields: newVals,
              });
            }}
            options={availableFields}
            placeholder="Airtable field"
            selectedValues={selectedFields}
          />
        </LabelWrapper>
      );
    }
    return null;
  };

  return (
    <div className="flex space-x-2">
      <Form.Dropdown
        label="Airtable base"
        name="airtableBase"
        value={selectedBase}
        onChange={(newVal: string) => {
          onAirtableConfigurationChange({
            ...airtableConfig,
            selectedBase: newVal,
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
            onAirtableConfigurationChange({
              ...airtableConfig,
              selectedTable: newVal,
              selectedFields: [],
            });
          }}
          options={availableTables}
        />
      )}
      {renderFieldSelector()}
    </div>
  );
}
