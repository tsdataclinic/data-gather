import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback } from 'react';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as Interview from '../../models/Interview';
// import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import LabelWrapper from '../ui/LabelWrapper';

interface Props {
  interview: Interview.T;
}

const labelStyle = { width: '10rem' };

// eslint-disable-next-line
function ConfigureCard({ interview }: Props): JSX.Element {
  const { startingState } = interview;
  const interviewStore = useInterviewStore();
  const screens = useInterviewScreens(interview.id);

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

  // TODO uncomment when I figure out why opening the dropdown
  // triggers the button onclick

  // const removeStartScreen = useCallback(
  //   async (index: number): Promise<void> => {
  //     await interviewStore.removeStartingScreen(interview.id, index);
  //   },
  //   [interviewStore, interview],
  // );

  if (!screens) {
    return <p>No screens yet!</p>;
  }

  const options = screens.map(screen => ({
    displayValue: screen.title,
    value: screen.id,
  }));

  return (
    <div className="grid h-60 w-full grid-cols-4 bg-white p-8 shadow-md">
      <div className="space-x-3">
        <FontAwesomeIcon size="1x" icon={faWrench} />
        <span>Configure</span>
      </div>
      <div className="col-span-3 space-y-4">
        <LabelWrapper
          inline
          label="Default Sequence"
          labelTextStyle={labelStyle}
        >
          {startingState.map((state, idx) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`startingstate_${state}_${idx}`}
              style={{ display: 'flex', marginBottom: '20px' }}
            >
              <Dropdown
                onChange={screenId => changeStartScreen(idx, screenId)}
                value={state}
                options={options}
                defaultButtonLabel=""
              />

              {/* <Button type="button" onClick={() => removeStartScreen(idx)}>
                -
              </Button> */}
            </div>
          ))}
          <Dropdown
            onChange={addStartScreen}
            defaultButtonLabel="Add another screen!"
            value={undefined}
            options={options}
          />
        </LabelWrapper>
      </div>
    </div>
  );
}

export default ConfigureCard;
