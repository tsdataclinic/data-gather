import * as React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Interview from '../../../models/Interview';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';

type Props = {
  interview: Interview.UpdateT;
  onSaveClick: () => void;
};

export default function ConfigureToolbar({
  interview,
  onSaveClick,
}: Props): JSX.Element {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  return (
    <div className="z-10 flex w-full justify-end bg-white px-8 py-4 shadow">
      <Toolbar.Root className="flex space-x-2">
        <Toolbar.Button asChild>
          <Button intent="primary" onClick={onSaveClick}>
            Save
          </Button>
        </Toolbar.Button>
        <Toolbar.Button asChild>
          <Button intent="danger" onClick={() => setIsDeleteModalOpen(true)}>
            Delete
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
                onClick={() => alert('Deletion is not implemented yet')}
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
