import { InterviewSettingType } from '../../api/models/InterviewSettingType';
import { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import { SpecialValueType } from '../../api/models/SpecialValueType';

export type AirtableField = {
  description?: string;
  id: string;
  name: string;
  options?: {
    choices?: ReadonlyArray<{
      color?: string[];
      id?: string;
      name?: string;
    }>;
  };
  type?: string;
};

export type AirtableTable = {
  description?: string;
  fields?: AirtableField[];
  id: string;
  name?: string;
};

export type AirtableBase = {
  id: string;
  name?: string;
  tables?: AirtableTable[];
};

export type AirtableAuthSettings = {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  refreshTokenExpires?: number;
  scope?: string;
  tokenType?: string;
};

export type AirtableSettings = {
  apiKey?: string;
  authSettings?: AirtableAuthSettings
  bases?: AirtableBase[];
};

/**
 * An action that is executed on interview submission.
 */
type InterviewSetting = {
  readonly id: string;
  readonly interviewId: string;
  readonly settings: AirtableSettings;
  readonly type: InterviewSettingType;
};

type InterviewSettingCreate = Omit<InterviewSetting, 'id'> & {
  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  readonly tempId: string;
};

export type { InterviewSetting as T };
export type { InterviewSettingCreate as CreateT };
export type { SerializedInterviewSettingRead as SerializedT };
export { InterviewSettingType as SettingType };
export { SpecialValueType };
