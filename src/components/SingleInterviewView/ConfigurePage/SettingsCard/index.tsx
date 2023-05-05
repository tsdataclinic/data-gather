import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import forge from 'node-forge';
import * as Interview from '../../../../models/Interview';
import * as InterviewSettings from '../../../../models/InterviewSetting';
import Button from '../../../ui/Button';
import LabelWrapper from '../../../ui/LabelWrapper';
import Dropdown from '../../../ui/Dropdown';
import { InterviewSettingType } from '../../../../api/models/InterviewSettingType';
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
  onSaveClick?: () => void;
};

function SettingsCard({ interview, onInterviewChange }: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleRefreshAirtableTokens = async (): Promise<void> => {
    await api.airtable.refreshAndUpdateAirtableAuth(interview.id);
    navigate(0);
  };

  const handleAuthenticateWithAirtable = (): void => {
    const buffer = forge.random.getBytesSync(100);
    let state = forge.util.encode64(buffer);
    state = state.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    localStorage.setItem(state, interview.id);
    window.location.href = `${process.env.REACT_APP_SERVER_URI}/api/airtable-auth?state=${state}&interview_id=${interview.id}`;
  };

  React.useEffect(() => {
    const handleAirtableAuthentication = (): void => {
      /*
        Connecting to Airtable via OAuth will route back to this component (via AllInterviewsView) with some URL query params.
        This takes those parameters after render, then redirects back to the same page, but without query params.
      */
      const searchParams = new URLSearchParams(location.search);
      if (searchParams) {
        const id = searchParams.get('id');
        const state = searchParams.get('state');
        if (id === 'airtable' && state && localStorage.getItem(state)) {
          const path = location.pathname;
          navigate(path);
        }
      }
    };

    handleAirtableAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSettingBlock = (setting: EditableSetting): JSX.Element => {
    switch (setting.type) {
      case InterviewSettings.SettingType.AIRTABLE: {
        const airtableSettings = setting.settings;
        return (
          <div key={`_${airtableSettings}`} className="space-y-4">
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
            <div>
              <Button
                aria-label="Refresh Airtable tokens"
                onClick={handleRefreshAirtableTokens}
              >
                Refresh Airtable tokens
              </Button>
            </div>
            <div>
              <Button
                aria-label="Get Airtable base schema"
                onClick={handleUpdateAirtableSchema}
              >
                Get Airtable schema
              </Button>
            </div>
            <div>
              {airtableSettings.authSettings?.accessToken ? (
                <span>
                  Interview is authenticated to Airtable.
                  {airtableSettings.authSettings?.refreshTokenExpires &&
                    ` Connection will expire on ${new Date(
                      airtableSettings.authSettings?.refreshTokenExpires,
                    ).toDateString()} if unused.`}
                </span>
              ) : (
                <Button onClick={handleAuthenticateWithAirtable}>
                  Connect to Airtable
                </Button>
              )}
            </div>
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
