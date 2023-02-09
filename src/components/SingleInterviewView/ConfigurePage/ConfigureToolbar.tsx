import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Interview from '../../../models/Interview';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../../hooks/useInterviewMutation';
import { useToast } from '../../ui/Toast';

type Props = {
  interview: Interview.UpdateT;
  onSaveClick: () => void;
  unsavedChanges: boolean;
};

export default function ConfigureToolbar({
  interview,
  onSaveClick,
  unsavedChanges,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const toaster = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const deleteInterview = useInterviewMutation({
    mutation: (interviewId: string, api: InterviewServiceAPI) =>
      api.interviewAPI.deleteInterview(interviewId),
    invalidateQuery: Interview.QueryKeys.allInterviews,
  });

  return (
    <div className="z-10 flex w-full justify-end bg-white px-8 py-4 shadow">
      <Toolbar.Root className="flex space-x-2">
        <Toolbar.Button asChild>
          <Button
            intent={unsavedChanges ? 'primary' : 'default'}
            onClick={onSaveClick}
          >
            Save
          </Button>
        </Toolbar.Button>
        <Toolbar.Button asChild>
          <Button intent="danger" onClick={() => setIsDeleteModalOpen(true)}>
            Delete Interview
          </Button>
        </Toolbar.Button>
      </Toolbar.Root>
      {isDeleteModalOpen && (
        <Modal
          title={`Delete ${interview.name}`}
          isOpen={isDeleteModalOpen}
          onDismiss={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="text-xl">
              Are you sure you want to delete this interview?
            </div>
            <div className="space-x-4 text-center">
              <Button
                intent="danger"
                onClick={() => {
                  deleteInterview(interview.id, {
                    onSuccess: () => {
                      navigate(Interview.ALL_INTERVIEWS_URL);
                      toaster.notifySuccess(
                        'Deleted interview',
                        `Interview '${interview.name}' has been deleted`,
                      );
                    },
                    onError: error => {
                      if (error instanceof Error) {
                        toaster.notifyError(
                          'Error deleting interview',
                          error.message,
                        );
                      }
                    },
                  });
                }}
              >
                Yes
              </Button>
              <Button onClick={() => setIsDeleteModalOpen(false)}>No</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
