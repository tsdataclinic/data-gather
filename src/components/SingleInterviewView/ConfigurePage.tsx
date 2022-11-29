import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as Interview from '../../models/Interview';
import LabelWrapper from '../ui/LabelWrapper';
import TextArea from '../ui/TextArea';
import MultiSelect from '../ui/MultiSelect';

type Props = {
  interview: Interview.WithScreensT;
};

function ConfigureCard({ interview }: Props): JSX.Element {
  const interviewStore = useInterviewStore();
  const screens = useInterviewScreens(interview.id);
  const [startingState, setStartingState] = React.useState<readonly string[]>(
    () => Interview.getStartingScreens(interview).map(screen => screen.id),
  );

  const [displayedNotes, setDisplayedNotes] = useState(interview.notes);

  const saveNotes = useCallback((): void => {
    const newInterview = {
      ...interview,
      notes: displayedNotes,
    };
    interviewStore.InterviewAPI.updateInterview(newInterview.id, newInterview);
  }, [displayedNotes, interviewStore, interview]);

  const onStartingStateChange = useCallback(
    (screenIds: string[]): void => {
      setStartingState(screenIds);
      interviewStore.InterviewAPI.updateInterviewStartingState(
        interview.id,
        screenIds,
      );
    },
    [interviewStore, interview],
  );

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
            <TextArea
              onChange={setDisplayedNotes}
              onEnterPress={saveNotes}
              value={displayedNotes}
            />
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
                onChange={onStartingStateChange}
                placeholder="Add a stage"
                selectedValues={startingState}
                options={getOptions()}
              />
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConfigureCard;
