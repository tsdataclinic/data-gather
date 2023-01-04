import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../ui/Button';
import InputText from '../../ui/InputText';

type Props = {
  name: string;
  onNameChange: (newName: string) => void;
};

export default function EditableName({
  name,
  onNameChange,
}: Props): JSX.Element {
  const [isEditingName, setIsEditingName] = React.useState(false);

  return (
    <>
      <FontAwesomeIcon
        className="h-6 w-6 pr-4"
        icon={IconType.faCircleQuestion}
      />
      <div className="flex h-fit items-center">
        {isEditingName ? (
          <InputText
            className="w-full py-1 px-2"
            value={name}
            onChange={onNameChange}
          />
        ) : (
          name
        )}
        <Button
          unstyled
          className="hover:text-gray-500"
          onClick={() => setIsEditingName(prev => !prev)}
        >
          <FontAwesomeIcon
            size="sm"
            className="ml-2"
            icon={isEditingName ? IconType.faCheck : IconType.faPencil}
          />
        </Button>
      </div>
    </>
  );
}
