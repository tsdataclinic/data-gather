import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { v4 as uuidv4 } from 'uuid';
import * as React from 'react';
import * as InterviewScreenEntry from '../../../models/InterviewScreenEntry';
import InputText from '../../ui/InputText';
import Button from '../../ui/Button';

type Props = {
  onSelectionConfigurationChange: (
    newConfig: InterviewScreenEntry.SingleSelectOptions,
  ) => void;
  selectionConfig: InterviewScreenEntry.SingleSelectOptions;
};

export default function SingleSelectEditor({
  onSelectionConfigurationChange,
  selectionConfig,
}: Props): JSX.Element {
  const { options } = selectionConfig;
  const [optionToAdd, setOptionToAdd] = React.useState<string>('');

  const onAddOption = (): void => {
    const newOption = {
      id: uuidv4(),
      value: optionToAdd,
    };
    onSelectionConfigurationChange({
      options: options.concat(newOption),
    });
    setOptionToAdd('');
  };

  return (
    <div className="space-y-2">
      <p>Options</p>
      {options.map(option => (
        <div className="space-x-2" key={option.id}>
          <InputText
            value={option.value}
            onChange={newVal => {
              onSelectionConfigurationChange({
                options: options.map(prevOpt =>
                  prevOpt.id === option.id
                    ? { ...prevOpt, value: newVal }
                    : prevOpt,
                ),
              });
            }}
          />
          <Button
            unstyled
            onClick={() => {
              onSelectionConfigurationChange({
                options: options.filter(prevOpt => prevOpt.id !== option.id),
              });
            }}
          >
            <FontAwesomeIcon
              className="hover:text-slate-400"
              icon={IconType.faX}
            />
          </Button>
        </div>
      ))}
      <div className="space-x-2">
        <InputText
          placeholder="New option"
          onChange={setOptionToAdd}
          value={optionToAdd}
          onEnterPress={onAddOption}
        />
        <Button intent="primary" onClick={onAddOption}>
          Add
        </Button>
      </div>
    </div>
  );
}
