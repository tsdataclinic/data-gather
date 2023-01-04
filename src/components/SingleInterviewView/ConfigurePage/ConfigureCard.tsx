import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import * as React from 'react';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import * as Interview from '../../../models/Interview';
import LabelWrapper from '../../ui/LabelWrapper';
import TextArea from '../../ui/TextArea';
import MultiSelect from '../../ui/MultiSelect';
import Button from '../../ui/Button';
import InputText from '../../ui/InputText';
import { useToast } from '../../ui/Toast';
import useInterviewMutation, {
  type InterviewServiceAPI,
} from '../../../hooks/useInterviewMutation';

type Props = {
  interview: Interview.WithScreensAndActions;
};

async function saveUpdatedInterview(
  data: {
    interview: Interview.WithScreensAndActions;
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

function ConfigureCard({ interview }: Props): JSX.Element {
  const toaster = useToast();
  const screens = useInterviewScreens(interview.id);
  const [startingState, setStartingState] = React.useState<readonly string[]>(
    () => Interview.getStartingScreens(interview).map(screen => screen.id),
  );
  const [publish, setPublish] = React.useState(() => interview.published);
  const [vanityUrl, setVanityUrl] = React.useState(() => interview.vanityUrl);

  const [displayedNotes, setDisplayedNotes] = React.useState(interview.notes);
  const updateScreen = useInterviewMutation({
    mutation: saveUpdatedInterview,
    invalidateQuery: ['interview', interview.id],
  });

  const onSaveClick = (): void => {
    updateScreen(
      {
        startingState,
        interview: {
          ...interview,
          notes: displayedNotes,
          published: publish,
          vanityUrl,
        },
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
    <div className="grid h-auto grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg">
      <div className="flex h-fit items-center space-x-3">
        <FontAwesomeIcon size="1x" icon={faWrench} />
        <h2>Configure</h2>
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

        <LabelWrapper inline label="Starting State" labelTextClassName="w-40">
          <MultiSelect
            onChange={setStartingState}
            placeholder="Add a stage"
            selectedValues={startingState}
            options={getOptions()}
          />
        </LabelWrapper>

        <LabelWrapper
          inline
          label="Publish interview"
          labelTextClassName="w-40"
          inlineContainerStyles={{ verticalAlign: 'text-top' }}
        >
          <MixedCheckbox
            onChange={e => setPublish(e.target.checked)}
            checked={publish}
          />
        </LabelWrapper>

        {publish && (
          <LabelWrapper inline label="Vanity URL" labelTextClassName="w-40">
            <InputText
              required
              onChange={e => setVanityUrl(e)}
              value={vanityUrl}
            />
          </LabelWrapper>
        )}

        <Button intent="primary" onClick={onSaveClick}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default ConfigureCard;
