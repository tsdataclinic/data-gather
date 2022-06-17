import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useContext } from 'react';
import AppContext from '../AppContext';
import Button from '../ui/Button';
import Form from '../ui/Form';
import Modal from '../ui/Modal';
import InterviewCard from './InterviewCard';

export default function AllInterviewsView(): JSX.Element {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { allInterviews } = useContext(AppContext);

  return (
    <div className="container pt-8 mx-auto space-y-8">
      <div className="flex">
        <h1 className="flex-1 text-3xl tracking-wider">My Interviews</h1>
        <Button onClick={() => setIsCreateModalOpen(p => !p)} className="py-3">
          <FontAwesomeIcon size="1x" icon={faPlus} />
        </Button>
      </div>
      {allInterviews.map(iview => (
        <InterviewCard key={iview.id} interview={iview} />
      ))}
      <Modal
        isOpen={isCreateModalOpen}
        onDismiss={() => setIsCreateModalOpen(false)}
      >
        <Form
          onSubmit={vals => {
            // TODO: replace this function body with a call to the
            // indexedDB API layer
            alert('Incomplete');
            console.log(vals);
          }}
        >
          <Form.Input name="name" label="Name" />
          <Form.Input name="description" label="Description" />
          <Form.SubmitButton />
        </Form>
      </Modal>
    </div>
  );
}
