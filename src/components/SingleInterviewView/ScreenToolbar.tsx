import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import styled from 'styled-components';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as Interview from '../../models/Interview';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useInterviewMutation, {
  InterviewServiceAPI,
} from '../../hooks/useInterviewMutation';
import DropdownMenu from '../ui/DropdownMenu';
import Dropdown from '../ui/Dropdown';
import * as Config from '../../config';
import useAppDispatch from '../../hooks/useAppDispatch';
import SelectedLanguageContext from './SelectedLanguageContext';

const StyledHeading = styled.h1`
  flex: 1;
  font-size: 1.5rem;
  letter-spacing: 0.025em;
`;

type Props = {
  interview: Interview.T;
  onNewActionClick: () => void;
  onNewEntryClick: () => void;
  onSaveClick: () => void;
  screen: InterviewScreen.T;
  unsavedChanges: boolean;
};

export default function ScreenToolbar({
  interview,
  screen,
  onNewEntryClick,
  onNewActionClick,
  onSaveClick,
  unsavedChanges,
}: Props): JSX.Element {
  const selectedLanguageCode = React.useContext(SelectedLanguageContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const deleteInterview = useInterviewMutation({
    mutation: (screenId: string, api: InterviewServiceAPI) =>
      api.interviewScreenAPI.deleteInterviewScreen(screenId),
  });
  const navigate = useNavigate();
  const { allowedLanguages } = interview;
  const dispatch = useAppDispatch();

  const languageOptions = React.useMemo(
    () =>
      allowedLanguages.map(langCode => ({
        displayValue: Config.LANGUAGES[langCode] ?? langCode,
        value: langCode,
      })),
    [allowedLanguages],
  );

  return (
    <div className="z-10 flex w-full bg-white px-8 py-4 shadow">
      <StyledHeading>
        {InterviewScreen.getTitle(screen, interview.defaultLanguage)}
      </StyledHeading>

      <Toolbar.Root className="flex space-x-2">
        {allowedLanguages.length > 1 ? (
          <div className="flex items-center space-x-2">
            <p>Currently editing in</p>
            <Dropdown
              className="!bg-gray-200 !text-gray-800 !shadow-none hover:!bg-gray-300 hover:!text-gray-900"
              value={selectedLanguageCode}
              options={languageOptions}
              onChange={newLanguageCode =>
                dispatch({
                  type: 'SELECTED_LANGUAGE_UPDATE',
                  languageCode: newLanguageCode,
                })
              }
            />
          </div>
        ) : null}
        <DropdownMenu menuButton="New Step">
          <DropdownMenu.Item onSelect={onNewEntryClick}>
            Add a Question
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={onNewActionClick}>
            Add an Action
          </DropdownMenu.Item>
        </DropdownMenu>
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
            Delete
          </Button>
        </Toolbar.Button>
      </Toolbar.Root>
      {isDeleteModalOpen && (
        <Modal
          title={`Delete ${InterviewScreen.getTitle(
            screen,
            interview.defaultLanguage,
          )}`}
          isOpen={isDeleteModalOpen}
          onDismiss={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="text-xl">
              Are you sure you want to delete this stage?
            </div>
            <div className="space-x-4 text-center">
              <Button
                intent="danger"
                onClick={() => {
                  deleteInterview(screen.id, {
                    onSuccess: () => {
                      setIsDeleteModalOpen(false);
                      navigate(
                        Interview.getConfigurePageURL(screen.interviewId),
                      );
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
