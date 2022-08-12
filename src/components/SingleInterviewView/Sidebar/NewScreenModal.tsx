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
export default function NewScreenModal({
  isOpen,
  onDismiss,
  onSubmit,
}: Props): JSX.Element {
  return (
    <Modal title="New screen" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="name" label="Name" />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
