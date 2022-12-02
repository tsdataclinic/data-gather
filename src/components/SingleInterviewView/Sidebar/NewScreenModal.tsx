import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import Form from '../../ui/Form';
import Modal from '../../ui/Modal';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../../hooks/useInterviewMutation';

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
  const createScreen = useInterviewMutation({
    mutation: (screen: InterviewScreen.CreateT, api: InterviewServiceAPI) =>
      api.interviewScreenAPI.createInterviewScreen(screen),
    invalidateQuery: ['interviewScreens', interview.id],
  });

  const onSubmit = (vals: Map<string, string>): void => {
    createScreen(
      InterviewScreen.create({
        title: vals.get('name') ?? '',
        interviewId: interview.id,
      }),
      {
        onSuccess: () => onDismiss(),
      },
    );
  };

  return (
    <Modal title="New stage" isOpen={isOpen} onDismiss={onDismiss}>
      <Form onSubmit={onSubmit}>
        <Form.Input name="name" label="Name" />
        <Form.SubmitButton />
      </Form>
    </Modal>
  );
}
