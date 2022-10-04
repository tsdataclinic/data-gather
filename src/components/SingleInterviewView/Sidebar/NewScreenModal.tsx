import { useCallback } from 'react';
import useAppDispatch from '../../../hooks/useAppDispatch';
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
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      const screen = InterviewScreen.create({
        title: vals.get('name') ?? '',
      });

      await interviewStore.addScreenToInterview(interview.id, screen);

      dispatch({
        interviewId: interview.id,
        screen,
        type: 'SCREEN_ADD',
      });
      onDismiss();
    },
    [interviewStore, dispatch, interview, onDismiss],
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
