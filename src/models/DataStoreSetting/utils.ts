import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../../util/assertUnreachable';
import * as DataStoreSetting from './types';

export const SETTING_TYPES: readonly DataStoreSetting.DataStoreType[] = [
  'airtable',
  'google_sheets',
];

function createDefaultConfig(
  type: DataStoreSetting.DataStoreType,
): DataStoreSetting.T['config'] {
  switch (type) {
    case 'airtable':
      return {
        type: 'airtable',
        authSettings: {},
      };
    case 'google_sheets':
      throw new Error(
        'Creating default GoogleSheets Config is not supported yet.',
      );
    default:
      return assertUnreachable(type);
  }
}

/**
 * Create a new empty DataStoreSetting
 */
export function create(
  values: Omit<DataStoreSetting.T, 'id' | 'config'> & {
    type: DataStoreSetting.DataStoreType;
  },
): DataStoreSetting.CreateT {
  return {
    interviewId: values.interviewId,
    tempId: uuidv4(),
    config: createDefaultConfig(values.type),
    type: values.type,
  };
}

export function dataStoreTypeToDisplayName(
  dataStoreType: DataStoreSetting.DataStoreType,
): string {
  switch (dataStoreType) {
    case 'airtable':
      return 'Airtable';
    case 'google_sheets':
      return 'Google Sheets';
    default:
      return assertUnreachable(dataStoreType);
  }
}
