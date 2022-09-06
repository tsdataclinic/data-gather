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

// eslint-disable-next-line
function ConfigureCard({ interview }: Props): JSX.Element {
  const { startingState } = interview;
  const interviewStore = useInterviewStore();
  const screens = useInterviewScreens(interview.id);

  const [displayedNotes, setDisplayedNotes] = useState(interview.notes);

  const saveNotes = useCallback(async (): Promise<void> => {
    await interviewStore.updateNotes(interview.id, displayedNotes);
  }, [displayedNotes, interviewStore, interview]);

  const changeStartScreen = useCallback(
    async (index: number, screenId: string): Promise<void> => {
      await interviewStore.updateStartingScreen(interview.id, index, screenId);
    },
    [interviewStore, interview],
  );

  const addStartScreen = useCallback(
    async (screenId: string): Promise<void> => {
      await interviewStore.addStartingScreen(interview.id, screenId);
    },
    [interviewStore, interview],
  );

  // TODO re-enable this when I figure out the dropdown triggering this
  // eslint-disable-next-line
  const removeStartScreen = useCallback(
    async (index: number): Promise<void> => {
      await interviewStore.removeStartingScreen(interview.id, index);
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

        <LabelWrapper
          inline
          label="Default Sequence"
          labelTextStyle={labelStyle}
          inlineContainerStyles={{ verticalAlign: 'text-top' }}
        >
          {startingState.map((state, idx) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`startingstate_${state}_${idx}`}
              style={{ display: 'flex', marginBottom: '20px' }}
            >
              {/* TODO this button's click handler is triggered when the dropdown below is opened */}
              {/* <Button type="button" onClick={() => removeStartScreen(idx)}>
                -
              </Button> */}
              <Dropdown
                onChange={screenId => changeStartScreen(idx, screenId)}
                value={state}
                options={getOptions()}
                defaultButtonLabel=""
              />
            </div>
          ))}
          <Dropdown
            onChange={addStartScreen}
            defaultButtonLabel="Add another screen!"
            value={undefined} // TODO this value gets updated when a screen is selected, so the same screen can't be selected twice
            options={getOptions()}
          />
        </LabelWrapper>
      </div>
    </div>
  );
}

export default ConfigureCard;
