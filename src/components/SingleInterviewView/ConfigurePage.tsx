import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as Interview from '../../models/Interview';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import LabelWrapper from '../ui/LabelWrapper';
import TextArea from '../ui/TextArea';

type Props = {
  interview: Interview.WithScreensT;
};

function ConfigureCard({ interview }: Props): JSX.Element {
  const interviewStore = useInterviewStore();
  const screens = useInterviewScreens(interview.id);
  const startingState = React.useMemo(
    () => Interview.getStartingScreens(interview),
    [interview],
  );

  const [displayedNotes, setDisplayedNotes] = useState(interview.notes);

  const saveNotes = useCallback((): void => {
    const newInterview = {
      ...interview,
      notes: displayedNotes,
    };
    interviewStore.InterviewAPI.updateInterview(newInterview.id, newInterview);
  }, [displayedNotes, interviewStore, interview]);

  const changeStartScreen = useCallback(
    (index: number, screenId: string): void => {
      const newInterview = Interview.updateStartingScreen(
        interview,
        index,
        screenId,
      );
      interviewStore.putInterview(newInterview);
    },
    [interviewStore, interview],
  );

  const addStartScreen = useCallback(
    (screenId: string): void => {
      const newInterview = Interview.addStartingScreen(interview, screenId);
      interviewStore.putInterview(newInterview);
    },
    [interviewStore, interview],
  );

  const removeStartScreen = useCallback(
    async (index: number): Promise<void> => {
      const newInterview = Interview.removeStartingScreen(interview, index);
      await interviewStore.putInterview(newInterview);
    },
    [interviewStore, interview],
  );

  if (!screens) {
    return <p>No screens yet!</p>;
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
              <div
                className="ml-4"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {startingState.map((screen, idx) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={`startingstate_${screen.id}_${idx}`}
                    style={{
                      display: 'flex',
                      marginBottom: '20px',
                      alignItems: 'center',
                    }}
                  >
                    <span className="w-32">
                      <Dropdown
                        onChange={screenId => changeStartScreen(idx, screenId)}
                        value={screen.id}
                        options={getOptions()}
                        placeholder=""
                      />
                    </span>

                    <span className="ml-2">
                      <Button
                        type="button"
                        onClick={() => removeStartScreen(idx)}
                      >
                        -
                      </Button>
                    </span>
                  </div>
                ))}
                <Dropdown
                  // We reset the key so that the component remounts, thus
                  // clearing the selection. This is due to a radix bug where
                  // `undefined` values make the component be treated as
                  // uncontrolled
                  key={startingState.length}
                  onChange={addStartScreen}
                  placeholder="Add another screen!"
                  value={undefined}
                  options={getOptions()}
                />
              </div>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConfigureCard;
