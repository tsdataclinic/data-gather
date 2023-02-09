import type { SerializedInterviewSettingCreate } from '../../api/models/SerializedInterviewSettingCreate';
import type { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import * as InterviewSetting from './types';
import { InterviewSettingType, SerializedAirtableSettings } from '../../api';

export function deserialize(
  serializedInterviewSetting: SerializedInterviewSettingRead,
): InterviewSetting.T {
  const { id, type, settings, interviewId } = serializedInterviewSetting;
  const deserializedSettings = new Map(
    Object.entries(settings).map(([key, val]) => {
      let deserializedKey;
      switch (key) {
        case InterviewSettingType.AIRTABLE:
        default:
          deserializedKey = InterviewSettingType.AIRTABLE;
          break;
      }
      return [deserializedKey, val];
    }),
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
): Record<InterviewSettingType, SerializedAirtableSettings> {
  const settingsObj: Record<InterviewSettingType, SerializedAirtableSettings> =
    {
      [InterviewSettingType.AIRTABLE]: {
        apiKey: '',
      },
    };
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
  const serializedSettings = serializeSettings(settings);

  return {
    ...interviewSetting,
    type,
    id,
    settings: serializedSettings,
  };
}

export function serializeCreate(
  interviewSetting: InterviewSetting.CreateT,
): SerializedInterviewSettingCreate {
  const { type, settings } = interviewSetting;

  const serializedSettings = serializeSettings(settings);

  // validitiy check?

  return {
    ...interviewSetting,
    type,
    settings: serializedSettings,
  };
}
