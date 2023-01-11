import { DateTime } from 'luxon';
import { SerializedUserRead } from '../api/models/SerializedUserRead';

interface User {
  readonly createdDate: DateTime;
  readonly email: string;
  readonly familyName: string;
  readonly givenName: string;
  readonly id: string;
  readonly identityProvider: string;
}

export function deserialize(rawObj: SerializedUserRead): User {
  return {
    ...rawObj,
    createdDate: DateTime.fromISO(rawObj.createdDate),
  };
}

export type { User as T };
