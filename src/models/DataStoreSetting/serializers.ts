import type { SerializedDataStoreSettingCreate } from '../../api/models/SerializedDataStoreSettingCreate';
import type { SerializedDataStoreSettingRead } from '../../api/models/SerializedDataStoreSettingRead';
import * as DataStoreSetting from './types';

export function deserialize(
  serializedDataStoreSetting: SerializedDataStoreSettingRead,
): DataStoreSetting.T {
  return serializedDataStoreSetting;
}

export function serialize(
  dataStoreSetting: DataStoreSetting.T,
): SerializedDataStoreSettingRead {
  return dataStoreSetting;
}

export function serializeCreate(
  dataStoreSetting: DataStoreSetting.CreateT,
): SerializedDataStoreSettingCreate {
  // TODO: validity check?
  return dataStoreSetting;
}
