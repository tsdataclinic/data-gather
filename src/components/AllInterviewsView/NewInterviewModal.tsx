import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useInterviewStore from '../../hooks/useInterviewStore';
import Form from '../ui/Form';
import Modal from '../ui/Modal';
import * as Interview from '../../models/Interview';

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
  const interviewStore = useInterviewStore();
  const queryClient = useQueryClient();
  const newInterviewMutation = useMutation({
    mutationFn: interviewStore.InterviewAPI.createInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['allInterviews'],
      });
      onDismiss();
    },
  });

  const onSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      newInterviewMutation.mutate(
        Interview.create({
          name: vals.get('name') ?? '',
          description: vals.get('description') ?? '',
        }),
      );
    },
    [newInterviewMutation],
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
