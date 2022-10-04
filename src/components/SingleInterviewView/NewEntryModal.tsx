import Form from '../ui/Form';
import Modal from '../ui/Modal';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (vals: Map<string, string>) => void;
};

/**
 * A modal with a form to create a new interview screen
 */
export default function NewEntryModal({
  isOpen,
  onDismiss,
  onSubmit,
}: Props): JSX.Element {
  return (
    <Modal title="New Question" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="name" label="Name" />
        <Form.Input name="prompt" label="Prompt" />
        <Form.Dropdown
          label="Response type"
          name="responseType"
          placeholder="What type of data is this?"
          options={[
            { displayValue: 'Text', value: 'text' },
            { displayValue: 'Number', value: 'number' },
            { displayValue: 'Yes/No', value: 'boolean' },
          ]}
        />
        <Form.Input name="text" label="Helper text" required={false} />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
