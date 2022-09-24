import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as Interview from '../../models/Interview';
// eslint-disable-next-line
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import LabelWrapper from '../ui/LabelWrapper';
import TextArea from '../ui/TextArea';

interface Props {
  interview: Interview.T;
}

const labelStyle = { width: '10rem' };

function ConfigureCard({ interview }: Props): JSX.Element {
  const { startingState } = interview;
  const interviewStore = useInterviewStore();
  const screens = useInterviewScreens(interview.id);

  const [displayedNotes, setDisplayedNotes] = useState(interview.notes);

  const saveNotes = useCallback((): void => {
    interviewStore.updateNotes(interview.id, displayedNotes);
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
    <div
      className="grid h-60 w-full grid-cols-4 bg-white p-8 shadow-md"
      style={{ height: 'auto' }}
    >
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faWrench} />
        <span>Configure</span>
      </div>
      <div className="col-span-3 space-y-4">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <LabelWrapper
          inline
          label="Notes"
          labelTextStyle={labelStyle}
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
            style={{
              display: 'flex',
              marginTop: '20px',
            }}
          >
            <div style={{ width: '10rem' }}>Starting State</div>
            <div
              style={{
                display: 'flex',
                marginLeft: '16px',
                flexDirection: 'column',
              }}
            >
              {startingState.map((state, idx) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`startingstate_${state}_${idx}`}
                  style={{
                    display: 'flex',
                    marginBottom: '20px',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ width: '8rem' }}>
                    <Dropdown
                      onChange={screenId => changeStartScreen(idx, screenId)}
                      value={state}
                      options={getOptions()}
                      defaultButtonLabel=""
                    />
                  </span>

                  <span style={{ marginLeft: '10px' }}>
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
                onChange={addStartScreen}
                defaultButtonLabel="Add another screen!"
                value={undefined} // TODO this value gets updated when a screen is selected, so the same screen can't be selected twice
                options={getOptions()}
              />
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}

export default ConfigureCard;
