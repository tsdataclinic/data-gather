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

type Props = {
  defaultInterview: Interview.WithScreensAndActions;
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
}: Props): JSX.Element {
  const [interview, setInterview] =
    React.useState<Interview.UpdateT>(defaultInterview);
  const toaster = useToast();
  const updateScreen = useInterviewMutation({
    mutation: saveUpdatedInterview,
    invalidateQuery: ['interview', interview.id],
  });
  const [startingState, setStartingState] = React.useState<readonly string[]>(
    () =>
      Interview.getStartingScreens(defaultInterview).map(screen => screen.id),
  );

  const onSaveClick = (): void => {
    console.log('interview', interview);
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
  };

  return (
    <>
      <ConfigureToolbar onSaveClick={onSaveClick} interview={interview} />
      <ScrollArea className="w-full overflow-auto">
        <div className="space-y-8 p-14">
          <ConfigureCard
            interview={interview}
            startingState={startingState}
            onStartingStateChange={setStartingState}
            onInterviewChange={setInterview}
          />
          <OnSubmitCard
            interview={interview}
            onInterviewChange={setInterview}
          />
        </div>
      </ScrollArea>
    </>
  );
}
