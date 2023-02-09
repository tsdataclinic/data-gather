import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MixedCheckbox } from '@reach/checkbox';
import * as React from 'react';
import useInterviewScreens from '../../../hooks/useInterviewScreens';
import * as Interview from '../../../models/Interview';
import * as InterviewScreen from '../../../models/InterviewScreen';
import LabelWrapper from '../../ui/LabelWrapper';
import TextArea from '../../ui/TextArea';
import InputText from '../../ui/InputText';
import useIsAuthenticated from '../../../auth/useIsAuthenticated';
import Dropdown from '../../ui/Dropdown';
import MultiSelect from '../../ui/MultiSelect';
import * as Config from '../../../config';

type Props = {
  interview: Interview.UpdateT;
  onInterviewChange: (interview: Interview.UpdateT) => void;
  onStartingStateChange: (startingState: readonly string[]) => void;
  startingState: readonly string[];
};

const LANGUAGE_OPTIONS = Object.entries(Config.LANGUAGES).map(
  ([languageKey, languageDisplayName]) => ({
    displayValue: languageDisplayName,
    value: languageKey,
  }),
);

function ConfigureCard({
  interview,
  startingState,
  onInterviewChange,
  onStartingStateChange,
}: Props): JSX.Element {
  const screens = useInterviewScreens(interview.id);
  const isAuthenticated = useIsAuthenticated();

  if (!screens) {
    return <p>No stages have been created yet!</p>;
  }

  const getScreenOptions = (): Array<{
    displayValue: string;
    value: string;
  }> =>
    screens.map(screen => ({
      displayValue: InterviewScreen.getTitle(screen),
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
          <TextArea
            onChange={val => {
              onInterviewChange({ ...interview, notes: val });
            }}
            value={interview.notes}
          />
        </LabelWrapper>

        <LabelWrapper
          inline
          label="Allowed languages"
          labelTextClassName="w-40"
          infoTooltip="These are the languages that questions can be presented in."
        >
          <MultiSelect
            onChange={languageCodes =>
              onInterviewChange({
                ...interview,
                allowedLanguages: languageCodes,
              })
            }
            placeholder="Add another language"
            options={LANGUAGE_OPTIONS}
            selectedValues={interview.allowedLanguages}
          />
        </LabelWrapper>

        <LabelWrapper
          inline
          label="Starting stage"
          labelTextClassName="w-40"
          infoTooltip="This is the first stage the user will see when they start. After that, the next stages will depend on the actions you configure."
        >
          <Dropdown
            onChange={screenId => onStartingStateChange([screenId])}
            placeholder="Add a stage"
            value={startingState[0]}
            options={getScreenOptions()}
          />
        </LabelWrapper>

        <LabelWrapper
          inline
          label="Publish interview"
          labelTextClassName="w-40"
          inlineContainerStyles={{ verticalAlign: 'text-top' }}
        >
          <MixedCheckbox
            onChange={e => {
              onInterviewChange({ ...interview, published: e.target.checked });
            }}
            checked={interview.published}
            disabled={!isAuthenticated}
          />
        </LabelWrapper>
        {!isAuthenticated && (
          <em className="text-red-600">
            You can&apos;t publish an interview while signed out!
          </em>
        )}

        {interview.published && (
          <LabelWrapper inline label="Vanity URL" labelTextClassName="w-40">
            <InputText
              required
              onChange={val => {
                onInterviewChange({ ...interview, vanityUrl: val });
              }}
              value={interview.vanityUrl}
            />
          </LabelWrapper>
        )}
      </div>
    </div>
  );
}

export default ConfigureCard;
