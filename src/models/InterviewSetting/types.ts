import { InterviewSettingType } from '../../api/models/InterviewSettingType';
import { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import { SpecialValueType } from '../../api/models/SpecialValueType';

export type AirtableList = {
  description?: string;
  id: string;
  name: string;
  type?: string;
};

export type AirtableTable = {
  description?: string;
  fields: AirtableList[];
  id: string;
  name: string;
};

export type AirtableSettings = {
  access_token: string;
  base_id?: string;
  tables?: AirtableTable[];
};

/**
 * An action that is executed on interview submission.
 */
type InterviewSetting = {
  readonly id: string;
  readonly interviewId: string;
  readonly settings: ReadonlyMap<string, AirtableSettings>;
  readonly type: string;
};

type InterviewSettingCreate = Omit<InterviewSetting, 'id' | 'settings'> & {
  readonly settings: Map<string, AirtableSettings>;

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
