import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../ui/Button';
import InputText from '../../ui/InputText';
import InfoIcon from '../../ui/InfoIcon';
import Form from '../../ui/Form';

type Props = {
  name: string;
  onNameChange: (newName: string) => void;
};

export default function EditableName({
  name,
  onNameChange,
}: Props): JSX.Element {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const editInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isEditingName && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditingName]);

  // TODO: using InputText here instead of Form.Input because Form.Input does
  // not support forward ref yet. Once Form.Input supports forwardRef then
  // use Form.Input instead of InputText.
  return (
    <>
      <FontAwesomeIcon
        className="h-6 w-6 pr-4"
        icon={IconType.faCircleQuestion}
      />
      <div>
        <div className="flex h-fit items-center">
          {isEditingName ? (
            <Form
              className="space-y-2"
              onSubmit={() => setIsEditingName(false)}
            >
              <InputText
                ref={editInputRef}
                className="w-full py-1 px-2"
                value={name}
                onChange={onNameChange}
              />
              <Form.SubmitButton size="small">Save</Form.SubmitButton>
            </Form>
          ) : (
            <span className="space-x-2">
              <h3 className="inline">{name}</h3>
              <Button
                unstyled
                className="hover:text-gray-500"
                onClick={() => setIsEditingName(true)}
              >
                <FontAwesomeIcon size="sm" icon={IconType.faPencil} />
              </Button>
              <InfoIcon tooltip="This is the reference name for this question. This is how you can refer to this question in actions. This name is never displayed to the user." />
            </span>
          )}
        </div>
      </div>
    </>
  );
}
