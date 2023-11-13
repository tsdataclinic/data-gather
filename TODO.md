## TODO:

1. Finish modeling the GoogleSheetsSettings classes
2. Update the frontend model to expect this union
3. Add the ability to authenticate with Google Sheets
4. Load the schema
5. Update the lookup config
6. Update the submission actions config
7. The frontend uses an AirtableService but instead we should
   have a DataStoreService that calls lookup, update, and
   insert, etc. and on the backend we send to the appropriate
   service.
8. On the backend, create a ExternalDataStoreConnector interface and create the AirtableService and GoogleSheetsService
9. We should use a /lookup, /update, and /insert endpoints that receive a config
   rather than a service specific (like /airtable-records) endpoint
10. In python, rename `AirtableSettings` and `GoogleSheetsSettings` to `AirtableConfig` and `GoogleSheetsConfig`
11. `src/api/` to `src/api-gen`

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

1. TABLE RENAME: `interview_setting` => `data_store_setting`
2. Added `type` to the data_store_setting configs
3. COLUMN RENAME: `settings` => `config` in `data_store_setting` table

upcoming:

2. DataStoreSetting `settings` to `config`
