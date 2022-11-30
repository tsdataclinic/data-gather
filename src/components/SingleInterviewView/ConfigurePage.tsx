import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import * as Interview from '../../models/Interview';
import LabelWrapper from '../ui/LabelWrapper';
import TextArea from '../ui/TextArea';
import MultiSelect from '../ui/MultiSelect';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../hooks/useInterviewMutation';

type Props = {
  interview: Interview.WithScreensT;
};

async function saveUpdatedScreen(
  data: {
    interview: Interview.WithScreensT;
    startingState: readonly string[];
  },
  api: InterviewServiceAPI,
): Promise<void> {
  await Promise.all([
    api.InterviewAPI.updateInterview(data.interview.id, data.interview),
    api.InterviewAPI.updateInterviewStartingState(
      data.interview.id,
      data.startingState,
    ),
  ]);
}

function ConfigureCard({ interview }: Props): JSX.Element {
  const toaster = useToast();
  const screens = useInterviewScreens(interview.id);
  const [startingState, setStartingState] = React.useState<readonly string[]>(
    () => Interview.getStartingScreens(interview).map(screen => screen.id),
  );

  const [displayedNotes, setDisplayedNotes] = React.useState(interview.notes);
  const updateScreen = useInterviewMutation({
    mutation: saveUpdatedScreen,
    invalidateQuery: ['interview', interview.id],
  });

  const onSaveClick = (): void => {
    updateScreen(
      {
        startingState,
        interview: { ...interview, notes: displayedNotes },
      },
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

  if (!screens) {
    return <p>No stages have been created yet!</p>;
  }

  const getOptions = (): Array<{
    displayValue: string;
    value: string;
  }> =>
    screens.map(screen => ({
      displayValue: screen.title,
      value: screen.id,
    }));

  return (
    <div className="w-full p-14">
      <div
        className="grid h-60 grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg"
        style={{ height: 'auto' }}
      >
        <div className="space-x-3">
          <FontAwesomeIcon size="1x" icon={faWrench} />
          <span>Configure</span>
        </div>
        <div className="col-span-3 space-y-4">
          <LabelWrapper
            inline
            label="Notes"
            labelTextClassName="w-40"
            inlineContainerStyles={{ verticalAlign: 'text-top' }}
          >
            <TextArea onChange={setDisplayedNotes} value={displayedNotes} />
          </LabelWrapper>

          <span>
            <div
              className="mt-5"
              style={{
                display: 'flex',
              }}
            >
              <div className="w-40">Starting State</div>
              <MultiSelect
                onChange={setStartingState}
                placeholder="Add a stage"
                selectedValues={startingState}
                options={getOptions()}
              />
            </div>
          </span>
          <Button intent="primary" onClick={onSaveClick}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfigureCard;
