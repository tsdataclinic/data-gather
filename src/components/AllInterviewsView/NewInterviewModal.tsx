import { useCallback } from 'react';
import Form from '../ui/Form';
import Modal from '../ui/Modal';
import * as Interview from '../../models/Interview';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../hooks/useInterviewMutation';
import useCurrentUser from '../../auth/useCurrentUser';

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
  const createInterview = useInterviewMutation({
    mutation: (interview: Interview.CreateT, api: InterviewServiceAPI) =>
      api.interviewAPI.createInterview(interview),
    invalidateQuery: ['allInterviews'],
  });
  const { user } = useCurrentUser();

  const onSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      if (user) {
        createInterview(
          Interview.create({
            ownerId: user.id,
            name: vals.get('name') ?? '',
            description: vals.get('description') ?? '',
          }),
          {
            onSuccess: () => onDismiss(),
          },
        );
      }
    },
    [createInterview, onDismiss, user],
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
