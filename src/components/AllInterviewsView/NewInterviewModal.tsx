import { useCallback } from 'react';
import useAppDispatch from '../../hooks/useAppDispatch';
import useInterviewStore from '../../hooks/useInterviewStore';
import Form from '../ui/Form';
import Modal from '../ui/Modal';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
};

/**
 * A modal with a form to create a new modal
 */
export default function NewInterviewModal({
  isOpen,
  onDismiss,
}: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();

  const onSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      const interview = await interviewStore.createInterview(
        vals.get('name') ?? '',
        vals.get('description') ?? '',
      );
      dispatch({
        interview,
        type: 'INTERVIEW_CREATE',
      });
      onDismiss();
    },
    [interviewStore, dispatch, onDismiss],
  );

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
