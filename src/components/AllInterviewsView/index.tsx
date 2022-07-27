import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppState from '../../hooks/useAppState';
import useInterviewStore from '../../hooks/useInterviewStore';
import Button from '../ui/Button';
import Form from '../ui/Form';
import Modal from '../ui/Modal';
import InterviewCard from './InterviewCard';
import useLoadInitialInterviews from './useLoadInitialInterviews';

export default function AllInterviewsView(): JSX.Element {
  const { isError } = useLoadInitialInterviews();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { allInterviews } = useAppState();

  const onInterviewCreationSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      const interview = await interviewStore.createInterview(
        uuidv4(),
        vals.get('name') ?? '',
        vals.get('description') ?? '',
      );
      dispatch({
        interview,
        type: 'INTERVIEW_CREATE',
      });
    },
    [interviewStore, dispatch],
  );

  return (
    <div className="container pt-8 mx-auto space-y-8">
      <div className="flex">
        <h1 className="flex-1 text-3xl tracking-wider">My Interviews</h1>
        <Button onClick={() => setIsCreateModalOpen(p => !p)} className="py-3">
          <FontAwesomeIcon size="1x" icon={faPlus} />
        </Button>
      </div>

      {isError ? <p>There was an error loading your interviews.</p> : null}

      {allInterviews.length === 0 ? (
        <p>You do not have any interviews.</p>
      ) : null}

      {allInterviews.map(iview => (
        <InterviewCard key={iview.id} interview={iview} />
      ))}

      <Modal
        isOpen={isCreateModalOpen}
        onDismiss={() => setIsCreateModalOpen(false)}
      >
        <Form onSubmit={onInterviewCreationSubmit}>
          <Form.Input name="name" label="Name" />
          <Form.Input name="description" label="Description" />
          <Form.SubmitButton />
        </Form>
      </Modal>
    </div>
  );
}
