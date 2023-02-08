import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../../util/assertUnreachable';
import * as InterviewSetting from './types';

export const SETTING_TYPES: readonly InterviewSetting.SettingType[] =
  Object.values(InterviewSetting.SettingType);

/**
 * Create a new empty InterviewSetting
 */
export function create(
  values: Omit<InterviewSetting.T, 'id' | 'settings'> & {
    type: InterviewSetting.SettingType;
  },
): InterviewSetting.CreateT {
  return {
    interviewId: values.interviewId,
    tempId: uuidv4(),
    settings: new Map([
      [
        'AirtableSetting',
        <InterviewSetting.AirtableSettings>{
          accessToken: '',
        },
      ],
    ]),
    type: values.type,
  };
}

export function settingTypeToDisplayName(
  settingType: InterviewSetting.SettingType,
): string {
  switch (settingType) {
    case InterviewSetting.SettingType.AIRTABLE:
      return 'Airtable';
    default:
      return assertUnreachable(settingType);
  }
}
