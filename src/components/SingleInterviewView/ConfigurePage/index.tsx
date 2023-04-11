import * as React from 'react';
import * as Interview from '../../../models/Interview';
import ConfigureCard from './ConfigureCard';
import OnSubmitCard from './OnSubmitCard';
import ScrollArea from '../../ui/ScrollArea';
import ConfigureToolbar from './ConfigureToolbar';
import { useToast } from '../../ui/Toast';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../../hooks/useInterviewMutation';
import SettingsCard from './SettingsCard';

type Props = {
  defaultInterview: Interview.WithScreensAndActions;
  setUnsavedChanges: (unsavedChanges: boolean) => void;
  unsavedChanges: boolean;
};

async function saveUpdatedInterview(
  data: {
    interview: Interview.UpdateT;
    startingState: readonly string[];
  },
  api: InterviewServiceAPI,
): Promise<void> {
  await Promise.all([
    api.interviewAPI.updateInterview(data.interview.id, data.interview),
    api.interviewAPI.updateInterviewStartingState(
      data.interview.id,
      data.startingState,
    ),
  ]);
}

export default function ConfigurePage({
  defaultInterview,
  unsavedChanges,
  setUnsavedChanges,
}: Props): JSX.Element {
  const [interview, setInterview] =
    React.useState<Interview.UpdateT>(defaultInterview);
  const toaster = useToast();
  const { mutate: updateScreen } = useInterviewMutation({
    mutation: saveUpdatedInterview,
    invalidateQuery: Interview.QueryKeys.getInterview(interview.id),
  });
  const [startingState, setStartingState] = React.useState<readonly string[]>(
    () =>
      Interview.getStartingScreens(defaultInterview).map(screen => screen.id),
  );

  // Reset the unsaved changes state when the page loads
  React.useEffect(() => {
    setUnsavedChanges(false);
  }, [setUnsavedChanges]);

  const onSaveClick = (): void => {
    updateScreen(
      { startingState, interview },
      {
        onSuccess: () =>
          toaster.notifySuccess('Saved!', `Successfully saved changes`),
        onError: error => {
          toaster.notifyError(
            'Error!',
            `There was a server error when saving your changes`,
          );
          console.error(error);
        },
      },
    );
    setUnsavedChanges(false);
  };

  const onInterviewChange = (changedInterview: Interview.UpdateT): void => {
    setUnsavedChanges(true);
    setInterview(changedInterview);
  };

  return (
    <>
      <ConfigureToolbar
        onSaveClick={onSaveClick}
        interview={interview}
        unsavedChanges={unsavedChanges}
      />
      <ScrollArea className="w-full overflow-auto">
        <div className="space-y-8 p-14">
          <ConfigureCard
            interview={interview}
            startingState={startingState}
            onStartingStateChange={setStartingState}
            onInterviewChange={onInterviewChange}
          />
          <SettingsCard
            interview={interview}
            onSaveClick={onSaveClick}
            onInterviewChange={setInterview}
          />
          <OnSubmitCard
            interview={interview}
            onInterviewChange={onInterviewChange}
          />
        </div>
      </ScrollArea>
    </>
  );
}
