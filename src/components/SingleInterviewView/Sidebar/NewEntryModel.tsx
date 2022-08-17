import Form from '../../ui/Form';
import Modal from '../../ui/Modal';

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
    <Modal title="New screen" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="prompt" label="Prompt" />
        <Form.Input name="responseType" label="Response Type" />
        <Form.Input name="text" label="Additional Text" />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
