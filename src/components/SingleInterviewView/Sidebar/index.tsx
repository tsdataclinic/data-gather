import { faCircleChevronLeft, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import Button from '../../ui/Button';
import NewScreenModal from './NewScreenModal';
import ScreenLink from './ScreenLink';
import { useToast } from '../../ui/Toast';
import ConfigureLink from './ConfigureLink';
import unsavedChangesConfirm from './unsavedChangesConfirm';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../../hooks/useInterviewMutation';
import { useDebouncedCallback } from '../../../hooks/useDebounce';

type Props = {
  interview: Interview.WithScreensAndActions;
  screens: InterviewScreen.WithChildrenT[] | undefined;
  unsavedChanges: boolean;
};

export default function Sidebar({
  interview,
  screens = [],
  unsavedChanges,
}: Props): JSX.Element {
  const [isNewScreenModalOpen, setIsNewScreenModalOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string>();
  const toaster = useToast();

  // configure the screen order mutation to refetch the necessary queries,
  // and optimistically update.
  const { mutate: updateScreenOrder } = useInterviewMutation({
    mutation: (
      params: {
        interviewId: string;
        newScreenOrder: readonly InterviewScreen.WithChildrenT[];
      },
      api: InterviewServiceAPI,
    ) =>
      api.interviewAPI.updateScreensOrder(
        params.interviewId,
        params.newScreenOrder.map(screen => screen.id),
      ),
    invalidateQueries: [
      Interview.QueryKeys.getInterview(interview.id),
      InterviewScreen.QueryKeys.getScreens(interview.id),
    ],
    onMutate: (params, queryClient) => {
      const previousScreenOrder: InterviewScreen.WithChildrenT[] | undefined =
        queryClient.getQueryData(
          InterviewScreen.QueryKeys.getScreens(interview.id),
        );

      // optimistically update the screens
      queryClient.setQueryData(
        InterviewScreen.QueryKeys.getScreens(interview.id),
        params.newScreenOrder,
      );
      return { previousScreenOrder };
    },

    // rollback the optimistic update if there was an error
    onError: (_error, _params, context, queryClient) => {
      if (context) {
        queryClient.setQueryData(
          InterviewScreen.QueryKeys.getScreens(interview.id),
          context.previousScreenOrder,
        );
      }
    },
  });

  // while the order is updating in the backend, this is the order we will show
  const [optimisticScreenOrder, setOptimisticScreenOrder] =
    useState<InterviewScreen.WithChildrenT[]>(screens);
  const [isReordering, setIsReordering] = useState(false);

  // create a debounced version of the backend mutation so that even if we do
  // multiple frontend reorders, we will only send the backend request once
  const sendUpdateScreenOrderRequest = useDebouncedCallback(
    (interviewId: string, newScreenOrder: InterviewScreen.WithChildrenT[]) => {
      updateScreenOrder(
        { interviewId, newScreenOrder },
        { onSuccess: () => setIsReordering(false) },
      );
    },
    400,
  );

  const onReorder = (newScreenOrder: InterviewScreen.WithChildrenT[]): void => {
    setOptimisticScreenOrder(newScreenOrder);
    setIsReordering(true);
    sendUpdateScreenOrderRequest(interview.id, newScreenOrder);
  };

  const screenOrderToDisplay = isReordering ? optimisticScreenOrder : screens;

  return (
    <nav className="relative top-0 z-20 h-full w-1/5 items-stretch bg-white shadow">
      <div className="flex flex-col items-start py-10 px-0">
        <div className="flex flex-row items-center gap-2.5 py-2.5 px-5 text-2xl">
          <NavLink
            className="h-7 w-7"
            to="/"
            onClick={e => {
              const letsGo = unsavedChangesConfirm(unsavedChanges);
              if (!letsGo) {
                e.preventDefault();
              }
            }}
          >
            <FontAwesomeIcon className="h-6 w-6" icon={faCircleChevronLeft} />
          </NavLink>
          {interview.name}
        </div>

        {/* Menu */}
        <div className="flex w-full flex-col items-start">
          <NavLink
            to={Interview.getRunUrl(interview)}
            className="flex flex-row items-center gap-2.5 py-2.5 pl-14 text-slate-600 hover:text-blue-700"
            onClick={e => {
              const letsGo = unsavedChangesConfirm(unsavedChanges);
              if (!letsGo) {
                e.preventDefault();
              }
              const startingScreens = Interview.getStartingScreens(interview);
              // disable going to the Run screen if we have no starting screens
              if (startingScreens.length === 0) {
                e.preventDefault();
                toaster.notifyError(
                  'Error',
                  'You need to select a stage to start with in the Configure page',
                );
              }
            }}
          >
            <FontAwesomeIcon size="1x" icon={faPlay} /> Run
          </NavLink>

          {/* Screens */}
          <Reorder.Group
            axis="y"
            values={screenOrderToDisplay}
            onReorder={onReorder}
          >
            {screenOrderToDisplay.map(screen => (
              <Reorder.Item key={screen.id} value={screen}>
                <ScreenLink
                  key={screen.id}
                  screen={screen}
                  defaultLanguage={interview.defaultLanguage}
                  onScreenSelect={setSelectedScreen}
                  isSelected={selectedScreen === screen.id}
                  unsavedChanges={unsavedChanges}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Configure */}
        <ConfigureLink
          onSelect={() => setSelectedScreen('configure')}
          isSelected={selectedScreen === 'configure'}
          unsavedChanges={unsavedChanges}
        />
      </div>

      <Button
        variant="full"
        intent="primary"
        className="absolute bottom-0 cursor-pointer py-4"
        onClick={() => setIsNewScreenModalOpen(true)}
      >
        New Stage
      </Button>

      <NewScreenModal
        interview={interview}
        isOpen={isNewScreenModalOpen}
        onDismiss={() => setIsNewScreenModalOpen(false)}
      />
    </nav>
  );
}
