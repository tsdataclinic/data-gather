import type { SerializedInterviewSettingCreate } from '../../api/models/SerializedInterviewSettingCreate';
import type { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import * as InterviewSetting from './types';
import { InterviewSettingType, SerializedAirtableSettings } from '../../api';

export function deserialize(
  serializedInterviewSetting: SerializedInterviewSettingRead,
): InterviewSetting.T {
  const { id, type, settings, interviewId } = serializedInterviewSetting;
  const deserializedSettings = new Map(
    Object.entries(settings).map(([key, val]) => [key, val]),
  );

  return {
    ...serializedInterviewSetting,
    id,
    type,
    settings: deserializedSettings,
    interviewId,
  };
}

function serializeSettings(
  settings: InterviewSetting.T['settings'],
): Record<string, SerializedAirtableSettings> {
  const settingsObj: Record<string, SerializedAirtableSettings> = {};
  settings.forEach((value, key) => {
    if (value !== undefined) {
      settingsObj[key] = value;
    }
  });
  return settingsObj;
}

export function serialize(
  interviewSetting: InterviewSetting.T,
): SerializedInterviewSettingRead {
  const { type, id, settings } = interviewSetting;
  let serializedInterviewType: InterviewSettingType;
  switch (type) {
    case InterviewSettingType.AIRTABLE:
    default:
      serializedInterviewType = InterviewSettingType.AIRTABLE;
      break;
  }

  const serializedSettings = serializeSettings(settings);

  return {
    ...interviewSetting,
    type: serializedInterviewType,
    id,
    settings: serializedSettings,
  };
}

export function serializeCreate(
  interviewSetting: InterviewSetting.CreateT,
): SerializedInterviewSettingCreate {
  const { type, settings } = interviewSetting;
  let serializedInterviewType: InterviewSettingType;
  switch (type) {
    case InterviewSettingType.AIRTABLE:
    default:
      serializedInterviewType = InterviewSettingType.AIRTABLE;
      break;
  }

  const serializedSettings = serializeSettings(settings);

  // validitiy check?

  return {
    ...interviewSetting,
    type: serializedInterviewType,
    settings: serializedSettings,
  };
}
