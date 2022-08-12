import Form from '../ui/Form';
import Modal from '../ui/Modal';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (vals: Map<string, string>) => void;
};

/**
 * A modal with a form to create a new modal
 */
export default function NewInterviewModal({
  isOpen,
  onDismiss,
  onSubmit,
}: Props): JSX.Element {
  return (
    <Modal title="New interview" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="name" label="Name" />
        <Form.Input name="description" label="Description" />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
