import * as React from 'react';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import forge from 'node-forge';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import useDrivePicker from 'react-google-drive-picker';
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs';
import * as Interview from '../../../../models/Interview';
import * as DataStoreSetting from '../../../../models/DataStoreSetting';
import Button from '../../../ui/Button';
import LabelWrapper from '../../../ui/LabelWrapper';
import Dropdown from '../../../ui/Dropdown';
import { FastAPIService } from '../../../../api/FastAPIService';
import assertUnreachable from '../../../../util/assertUnreachable';

const api = new FastAPIService();

type EditableSetting = DataStoreSetting.T | DataStoreSetting.CreateT;

type Props = {
  interview: Interview.UpdateT;
  onInterviewChange: (interview: Interview.UpdateT) => void;
  onSaveClick?: () => void;
};

function SettingsCard({ interview, onInterviewChange }: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGDrivePicker] = useDrivePicker();

  const configuredSettings = React.useMemo(() => {
    return new Set(interview.dataStoreSettings.map(setting => setting.type));
  }, [interview.dataStoreSettings]);

  const settingTypeOptions = React.useMemo(() => {
    return DataStoreSetting.SETTING_TYPES.map(dataStoreType => ({
      displayValue: DataStoreSetting.dataStoreTypeToDisplayName(dataStoreType),
      value: dataStoreType,
      disabled: configuredSettings.has(dataStoreType),
    }));
  }, [configuredSettings]);

  const onAddClick = (): void => {
    // pick the first setting that isn't already configured. Use this as the
    // default type for our new DataStoreSetting object
    const firstAvailableSettingType = DataStoreSetting.SETTING_TYPES.find(
      settingType => !configuredSettings.has(settingType),
    );

    if (firstAvailableSettingType) {
      onInterviewChange({
        ...interview,
        dataStoreSettings: interview.dataStoreSettings.concat(
          DataStoreSetting.create({
            interviewId: interview.id,
            type: firstAvailableSettingType,
          }),
        ),
      });
    }
  };

  const onSettingRemove = (settingToRemove: EditableSetting): void => {
    onInterviewChange({
      ...interview,
      dataStoreSettings: interview.dataStoreSettings.filter(
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
      dataStoreSettings: interview.dataStoreSettings.map(setting =>
        setting === settingToReplace ? newSetting : setting,
      ),
    });
  };

  const updateAirtableSchema = async (): Promise<void> => {
    await api.dataStores.updateDataStoreSchema('airtable', interview.id);
    navigate(0);
  };

  const handleRefreshAirtableTokens = async (): Promise<void> => {
    await api.airtable.refreshAndUpdateAirtableAuth(interview.id);
    navigate(0);
  };

  const updateGoogleSheetsSchema = async (
    docs: CallbackDoc[],
  ): Promise<void> => {
    await api.dataStores.updateDataStoreSchema('google_sheets', interview.id, {
      spreadsheetIds: docs.map(doc => doc.id),
    });
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
    // serialize the current state so we can reset the appropriate state when the
    // page redirects back
    localStorage.setItem(state, interview.id);
    window.location.href = `${process.env.REACT_APP_SERVER_URI}/api/airtable-auth?state=${state}&interview_id=${interview.id}`;
  };

  const handleAuthenticateWithGoogle = (): void => {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    const form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
      client_id: process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID ?? '',
      redirect_uri: process.env.REACT_APP_GOOGLE_SHEETS_REDIRECT_URI ?? '',
      response_type: 'code',
      scope: process.env.REACT_APP_GOOGLE_SHEETS_SCOPE ?? '',
      include_granted_scopes: 'true',
      state: interview.id,
      access_type: 'offline',
    };

    // Add form parameters as hidden input values.
    Object.entries(params).forEach(([paramKey, param]) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', paramKey);
      input.setAttribute('value', param);
      form.appendChild(input);
    });

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
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
    const dataStoreConfig = setting.config;
    switch (dataStoreConfig.type) {
      case 'airtable':
        return (
          <div key={dataStoreConfig.type} className="space-y-4">
            {dataStoreConfig.bases &&
              renderAirtableBaseTable(dataStoreConfig.bases)}
            <div>
              {dataStoreConfig.authSettings.accessToken ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      aria-label="Get Airtable base schema"
                      onClick={updateAirtableSchema}
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
      case 'google_sheets': {
        return (
          <div key={dataStoreConfig.type} className="space-y-4">
            {dataStoreConfig.spreadsheets &&
            dataStoreConfig.spreadsheets.length > 0 ? (
              <div>
                {dataStoreConfig.spreadsheets.map(spreadsheet => {
                  return (
                    <div key={spreadsheet.id}>
                      <p>Spreadsheet: {spreadsheet.title}</p>
                      <div className="ml-2">
                        {spreadsheet.worksheets.map(worksheet => {
                          return (
                            <>
                              <p key={worksheet.title}>
                                Worksheet: {worksheet.title}
                              </p>
                              <p className="ml-2">
                                Columns: {worksheet.columns.join(', ')}
                              </p>
                            </>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <p className="font-bold text-red-500">
                  Google Sheets integration is not yet fully available. Coming
                  soon!
                </p>
              </div>
            ) : null}

            {dataStoreConfig.spreadsheets === undefined &&
            dataStoreConfig.authSettings.accessToken ? (
              <Button
                intent="primary"
                onClick={() => {
                  openGDrivePicker({
                    clientId:
                      process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID ?? '',
                    developerKey:
                      process.env.REACT_APP_GOOGLE_DRIVE_PICKER_API_KEY ?? '',
                    viewId: 'SPREADSHEETS',
                    token: dataStoreConfig.authSettings.accessToken,
                    showUploadView: true,
                    showUploadFolders: true,
                    supportDrives: true,
                    multiselect: true,
                    appId: process.env.REACT_APP_GOOGLE_SHEETS_APP_ID ?? '',
                    customScopes: [
                      process.env.REACT_APP_GOOGLE_SHEETS_SCOPE ?? '',
                    ],
                    callbackFunction: data => {
                      const { docs, action } = data;
                      if (action === 'picked') {
                        updateGoogleSheetsSchema(docs);
                      }
                    },
                  });
                }}
              >
                Connect to spreadsheets from your Google Drive
              </Button>
            ) : null}
            {!dataStoreConfig.authSettings.accessToken ? (
              <Button intent="primary" onClick={handleAuthenticateWithGoogle}>
                Connect to Google Sheets
              </Button>
            ) : null}
          </div>
        );
      }
      default:
        return assertUnreachable(dataStoreConfig);
    }
  };

  return (
    <div className="grid h-auto grid-cols-4 border border-gray-200 bg-white p-8 shadow-lg">
      <div className="flex h-fit items-center space-x-3">
        <FontAwesomeIcon size="1x" icon={IconType.faGear} />
        <h2>Data Store Settings</h2>
      </div>
      <div className="col-span-3 space-y-4">
        {interview.dataStoreSettings.map(setting => (
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
                options={settingTypeOptions}
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
          // Quick way to disallow more data stores: if the number of data store
          // settings is equal to the number of possible data stores.
          disabled={
            DataStoreSetting.SETTING_TYPES.length ===
            interview.dataStoreSettings.length
          }
        >
          + Add Data Store
        </Button>
      </div>
    </div>
  );
}

export default SettingsCard;
