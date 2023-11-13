import { SerializedDataStoreSettingRead } from '../../api/models/SerializedDataStoreSettingRead';
import { SerializedAirtableConfig } from '../../api/models/SerializedAirtableConfig';
import { SerializedGoogleSheetsConfig } from '../../api/models/SerializedGoogleSheetsConfig';
import { DataStoreType } from '../../api';

/**
 * An action that is executed on interview submission.
 */
type DataStoreSetting = {
  readonly config: SerializedAirtableConfig | SerializedGoogleSheetsConfig;
  readonly id: string;
  readonly interviewId: string;
  readonly type: DataStoreType;
};

type DataStoreSettingCreate = Omit<DataStoreSetting, 'id'> & {
  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  readonly tempId: string;
};

export type { DataStoreSetting as T };
export type { DataStoreSettingCreate as CreateT };
export type { SerializedDataStoreSettingRead as SerializedT };
export type { SpecialValueType } from '../../api/models/SpecialValueType';
export type { DataStoreType };
export * from './AirtableConfig';
