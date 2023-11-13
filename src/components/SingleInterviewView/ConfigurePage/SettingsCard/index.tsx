import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import forge from 'node-forge';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import * as Interview from '../../../../models/Interview';
import * as DataStoreSetting from '../../../../models/DataStoreSetting';
import Button from '../../../ui/Button';
import LabelWrapper from '../../../ui/LabelWrapper';
import Dropdown from '../../../ui/Dropdown';
import { FastAPIService } from '../../../../api/FastAPIService';

const api = new FastAPIService();

type EditableSetting = DataStoreSetting.T | DataStoreSetting.CreateT;
const SETTING_TYPE_OPTIONS = DataStoreSetting.SETTING_TYPES.map(
  dataStoreType => ({
    displayValue: DataStoreSetting.dataStoreTypeToDisplayName(dataStoreType),
    value: dataStoreType,
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
        DataStoreSetting.create({
          interviewId: interview.id,
          type: 'airtable',
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
    // https://github.com/Airtable/oauth-example/blob/main/index.js#L55
    const state = forge.util
      .encode64(buffer)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
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

  const renderAirtableBaseTable = (
    bases: DataStoreSetting.AirtableBase[],
  ): JSX.Element => {
    const rowDefs = bases.flatMap(base =>
      base.tables?.flatMap(table =>
        table.fields?.map(field => ({
          baseName: base.name,
          tableName: table.name,
          fieldName: field.name,
          fieldOptions: field.options,
          fieldType: field.type,
        })),
      ),
    );
    const columnDefs = [
      { field: 'baseName' },
      { field: 'tableName' },
      { field: 'fieldName' },
      { field: 'fieldType' },
    ];

    return (
      <div style={{ height: '350px' }}>
        <AgGridReact
          headerHeight={50}
          rowHeight={50}
          defaultColDef={{
            headerClass: 'bg-gray-200',
            cellStyle: {
              display: 'flex',
              height: '100%',
              alignItems: 'center',
            },
          }}
          className="text-lg"
          rowSelection="single"
          rowData={rowDefs}
          columnDefs={columnDefs}
        />
      </div>
    );
  };

  const renderSettingBlock = (setting: EditableSetting): JSX.Element => {
    switch (setting.type) {
      case 'airtable': {
        const dataStoreConfig = setting.settings;
        return (
          <div key={dataStoreConfig.type} className="space-y-4">
            {dataStoreConfig.type === 'airtable' &&
              dataStoreConfig.bases &&
              renderAirtableBaseTable(dataStoreConfig.bases)}
            <div>
              {dataStoreConfig.type === 'airtable' &&
              dataStoreConfig.authSettings?.accessToken ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      aria-label="Get Airtable base schema"
                      onClick={handleUpdateAirtableSchema}
                      intent="primary"
                    >
                      Refresh Airtable schema
                    </Button>
                    <Button
                      aria-label="Refresh Airtable tokens"
                      onClick={handleRefreshAirtableTokens}
                    >
                      Refresh Airtable tokens
                    </Button>
                  </div>
                  <p>
                    Interview is authenticated to Airtable.
                    {dataStoreConfig.authSettings?.refreshTokenExpires &&
                      ` Connection will expire on ${new Date(
                        dataStoreConfig.authSettings?.refreshTokenExpires,
                      ).toDateString()} if unused.`}
                  </p>
                </div>
              ) : (
                <Button
                  intent="primary"
                  onClick={handleAuthenticateWithAirtable}
                >
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
        <h2>Datastore Settings</h2>
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
            <LabelWrapper className="mb-4" label="Data Store">
              <Dropdown
                value={setting.type}
                options={SETTING_TYPE_OPTIONS}
                onChange={dataStoreType => {
                  // reuse the same id so that we edit the existing setting
                  onSettingChange(
                    setting,
                    DataStoreSetting.create({
                      type: dataStoreType,
                      interviewId: setting.interviewId,
                    }),
                  );
                }}
              />
            </LabelWrapper>
            {renderSettingBlock(setting)}
          </div>
        ))}
        <Button
          intent="primary"
          onClick={onAddClick}
          // Quick way to disallow multiple Airtable settings
          // TODO: change this when adding more DataStoreTypes
          disabled={interview.interviewSettings.some(
            setting => setting.type === 'airtable',
          )}
        >
          + Add Data Store
        </Button>
      </div>
    </div>
  );
}

export default SettingsCard;
