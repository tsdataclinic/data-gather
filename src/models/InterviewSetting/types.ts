import { InterviewSettingType } from '../../api/models/InterviewSettingType';
import { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import { SpecialValueType } from '../../api/models/SpecialValueType';

export type AirtableField = {
  description?: string;
  id: string;
  name: string;
  options?: Record<string, unknown>;
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

export type AirtableSettings = {
  apiKey: string;
  bases?: AirtableBase[];
};

/**
 * An action that is executed on interview submission.
 */
type InterviewSetting = {
  readonly id: string;
  readonly interviewId: string;
  readonly settings: ReadonlyMap<InterviewSettingType, AirtableSettings>;
  readonly type: InterviewSettingType;
};

type InterviewSettingCreate = Omit<InterviewSetting, 'id' | 'settings'> & {
  readonly settings: Map<InterviewSettingType, AirtableSettings>;

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
