import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import * as Interview from '../../../../models/Interview';
import * as InterviewSettings from '../../../../models/InterviewSetting';
import Button from '../../../ui/Button';
import LabelWrapper from '../../../ui/LabelWrapper';
import Dropdown from '../../../ui/Dropdown';
import { InterviewSettingType } from '../../../../api/models/InterviewSettingType';
import InputText from '../../../ui/InputText';
import { FastAPIService } from '../../../../api/FastAPIService';

const api = new FastAPIService();

type EditableSetting = InterviewSettings.T | InterviewSettings.CreateT;
const SETTING_TYPE_OPTIONS = InterviewSettings.SETTING_TYPES.map(
  settingType => ({
    displayValue: InterviewSettings.settingTypeToDisplayName(settingType),
    value: settingType,
  }),
);

type Props = {
  interview: Interview.UpdateT;
  onInterviewChange: (interview: Interview.UpdateT) => void;
};

function SettingsCard({ interview, onInterviewChange }: Props): JSX.Element {
  const navigate = useNavigate();
  const onAddClick = (): void => {
    onInterviewChange({
      ...interview,
      interviewSettings: interview.interviewSettings.concat(
        InterviewSettings.create({
          interviewId: interview.id,
          type: InterviewSettings.SettingType.AIRTABLE,
        }),
      ),
    });
  };
  const onSettingRemove = (settingToRemove: EditableSetting): void => {
    onInterviewChange({
      ...interview,
      interviewSettings: interview.interviewSettings.filter(
        setting => setting !== settingToRemove,
      ),
    });
  };
  const onSettingChange = (
    settingToReplace: EditableSetting,
    newSetting: EditableSetting,
  ): void => {
    onInterviewChange({
      ...interview,
      interviewSettings: interview.interviewSettings.map(setting =>
        setting === settingToReplace ? newSetting : setting,
      ),
    });
  };

  const handleUpdateAirtableSchema = async (): Promise<void> => {
    await api.airtable.getAirtableSchema(interview.id);
    navigate(0);
  };

  const renderSettingBlock = (setting: EditableSetting): JSX.Element => {
    switch (setting.type) {
      case InterviewSettings.SettingType.AIRTABLE: {
        const airtableSettings = setting.settings;
        return (
          <div key={`_${airtableSettings.apiKey}`} className="space-y-4">
            <LabelWrapper label="Airtable Personal Access Token">
              <InputText
                onChange={(apiKey: string) => {
                  onSettingChange(setting, {
                    ...setting,
                    settings: { apiKey },
                  });
                }}
                defaultValue={airtableSettings.apiKey}
                placeholder="Enter Airtable personal access token..."
              />
            </LabelWrapper>
            {airtableSettings.bases?.flatMap(base => (
              <>
                <div>Base: {base.name}</div>
                {base.tables?.map(table => (
                  <div key={`${table}`}>
                    Table: {table.name}
                    <div>Fields:</div>
                    {table.fields?.map(field => (
                      <li key={`${field}`}>{field.name}</li>
                    ))}
                  </div>
                ))}
              </>
            ))}
            <Button onClick={handleUpdateAirtableSchema}>
              Update Airtable schema
            </Button>
          </div>
        );
      }
      default:
        return <div />;
    }
  };

  return (
    <div className="grid h-auto grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg">
      <div className="flex h-fit items-center space-x-3">
        <FontAwesomeIcon size="1x" icon={IconType.faGear} />
        <h2>Interview settings</h2>
      </div>
      <div className="col-span-3 space-y-4">
        {interview.interviewSettings.map(setting => (
          <div
            key={'id' in setting ? setting.id : setting.tempId}
            className="relative rounded border border-gray-300 bg-gray-50 p-4 text-slate-800"
          >
            <Button
              unstyled
              className="absolute top-4 right-4"
              type="button"
              onClick={() => onSettingRemove(setting)}
            >
              <FontAwesomeIcon
                aria-label="Delete"
                className="h-5 w-5 text-slate-400 transition-colors duration-200 hover:text-red-500"
                icon={IconType.faX}
              />
            </Button>
            <LabelWrapper className="mb-4" label="Setting type">
              <Dropdown
                value={setting.type}
                options={SETTING_TYPE_OPTIONS}
                onChange={settingType => {
                  // reuse the same id so that we edit the existing setting
                  onSettingChange(
                    setting,
                    InterviewSettings.create({
                      type: settingType as InterviewSettingType,
                      interviewId: setting.interviewId,
                    }),
                  );
                }}
              />
            </LabelWrapper>
            {renderSettingBlock(setting)}
          </div>
        ))}
        <Button intent="primary" onClick={onAddClick}>
          + Add setting
        </Button>
      </div>
    </div>
  );
}

export default SettingsCard;
