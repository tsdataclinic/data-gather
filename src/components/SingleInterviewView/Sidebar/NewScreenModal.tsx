import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useInterviewStore from '../../../hooks/useInterviewStore';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import Form from '../../ui/Form';
import Modal from '../../ui/Modal';

type Props = {
  interview: Interview.T;
  isOpen: boolean;
  onDismiss: () => void;
};

/**
 * A modal with a form to create a new interview screen
 */
export default function NewScreenModal({
  interview,
  isOpen,
  onDismiss,
}: Props): JSX.Element {
  const interviewStore = useInterviewStore();
  const queryClient = useQueryClient();
  const createScreenMutation = useMutation({
    mutationFn: interviewStore.InterviewScreenAPI.createInterviewScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interviewScreens', interview.id],
      });
      onDismiss();
    },
  });

  const onSubmit = useCallback(
    (vals: Map<string, string>) => {
      createScreenMutation.mutate(
        InterviewScreen.create({
          title: vals.get('name') ?? '',
          interviewId: interview.id,
        }),
      );
    },
    [createScreenMutation, interview],
  );

  return (
    <Modal title="New stage" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="name" label="Name" />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
