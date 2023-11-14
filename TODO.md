## TODO:

1. Load the schema
2. Finish modeling the GoogleSheetsSettings classes
3. Update the frontend model to expect this union
4. Update the lookup config
5. Update the submission actions config
6. The frontend uses an AirtableService but instead we should
   have a DataStoreService that calls lookup, update, and
   insert, etc. and on the backend we send to the appropriate
   service.
7. On the backend, create a ExternalDataStoreConnector interface and create the AirtableService and GoogleSheetsService
8. We should use a /lookup, /update, and /insert endpoints that receive a config
   rather than a service specific (like /airtable-records) endpoint
9. `src/api/` to `src/api-gen`
10. Rename the other `airtable_config.py`
11. Verify the refresh token on every endpoint call and re-auth if necessary

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
