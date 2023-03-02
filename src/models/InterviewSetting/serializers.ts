import type { SerializedInterviewSettingCreate } from '../../api/models/SerializedInterviewSettingCreate';
import type { SerializedInterviewSettingRead } from '../../api/models/SerializedInterviewSettingRead';
import * as InterviewSetting from './types';

export function deserialize(
  serializedInterviewSetting: SerializedInterviewSettingRead,
): InterviewSetting.T {
  const { id, type, interviewId } = serializedInterviewSetting;
  return {
    ...serializedInterviewSetting,
    id,
    type,
    interviewId,
  };
}

export function serialize(
  interviewSetting: InterviewSetting.T,
): SerializedInterviewSettingRead {
  const { type, id } = interviewSetting;
  return {
    ...interviewSetting,
    type,
    id,
  };
}

export function serializeCreate(
  interviewSetting: InterviewSetting.CreateT,
): SerializedInterviewSettingCreate {
  const { type } = interviewSetting;

  // TODO: validitiy check?

  return {
    ...interviewSetting,
    type,
  };
}
