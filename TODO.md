## TODO:

2. Add `type` to the DataStoreConfig
3. Change `settings` column to `config`
   E.g. `dataStoreSetting?.settings` should be `dataStoreSetting.config`
4. Rename AirtableSetting to AirtableConfig and GoogleSheetsSettings to GoogleSheetsConfig
5. Rename all instances of `interviewSetting` to `dataStoreSetting`
6. Finish modeling the GoogleSheetsSettings classes
7. Update the frontend model to expect this union
8. Add the ability to authenticate with Google Sheets
9. Load the schema
10. Update the lookup config
11. Update the submission actions config
12. The frontend uses an AirtableService but instead we should
    have a DataStoreService that calls lookup, update, and
    insert, etc. and on the backend we send to the appropriate
    service.
13. On the backend, create a ExternalDataStoreConnector interface and create the AirtableService and GoogleSheetsService
14. We should use a /lookup, /update, and /insert endpoints that receive a config
    rather than a service specific (like /airtable-records) endpoint
15. Change `interview.interviewSettings` to `interview.dataStoreSettings`. And take note of this migration in your notebook.
16. In python, rename `AirtableSettings` and `GoogleSheetsSettings` to `AirtableConfig` and `GoogleSheetsConfig`

Places that need switch statement:

1. SingleSelectEditor
2. InsertRowActionBlock
3. EditRowActionBlock
4. OnSubmitCard/EntryDropdown.tsx (how we load the fields from a data store if an Entry was chosen that is an Airtable or GoogleSheets type)
5. The /lookup, /update, and /insert endpoints to call the appropriate interface
6. ConfigurePage/SettingsCard/index.tsx
7. AirtableFieldSelector (no switch, but more cleanly extract the airtableConfig)
8. SingleConditionRow
9. InterviewRunnerView/InterviewRunnerEntry.tsx
10. InterviewRunnerView/index.tsx

Migrations:

1. TABLE NAME: interview_setting-> data_store_setting

upcoming:

1. DataStoreConfigs now have a `type`
2. DataStoreSetting `settings` to `config`
