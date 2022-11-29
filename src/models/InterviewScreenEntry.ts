import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import { SerializedInterviewScreenEntryRead } from '../api/models/SerializedInterviewScreenEntryRead';
import { SerializedInterviewScreenEntryCreate } from '../api/models/SerializedInterviewScreenEntryCreate';
import { ResponseType } from '../api/models/ResponseType';

export const RESPONSE_TYPES: readonly ResponseType[] =
  Object.values(ResponseType);

/**
 * Represents a single question asked to the interview subject
 */
interface InterviewScreenEntry {
  readonly id: string;

  /**  The name to display on the sidebar */
  readonly name: string;

  /** The index of this entry in the screen */
  readonly order: number;

  /**  The text of the question */
  readonly prompt: string;

  /** The key associated with the response to the question */
  readonly responseKey: string;

  /** The data type expected as a response */
  readonly responseType: ResponseType;

  /** The screen that this entry belongs to */
  readonly screenId: string;

  /** Additional flavor text associated with the question */
  readonly text: string;
}

type InterviewScreenEntryCreate = Omit<InterviewScreenEntry, 'id'> & {
  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  tempId: string;
};

export function create(
  values: Omit<InterviewScreenEntry, 'id' | 'responseKey' | 'tempId'>,
): InterviewScreenEntryCreate {
  return {
    ...values,
    responseKey: uuidv4(),
    tempId: uuidv4(),
  };
}

export function deserialize(
  rawObj: SerializedInterviewScreenEntryRead,
): InterviewScreenEntry {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(
  screenEntry: InterviewScreenEntry,
): SerializedInterviewScreenEntryRead;
export function serialize(
  screenEntry: InterviewScreenEntryCreate,
): SerializedInterviewScreenEntryCreate;
export function serialize(
  screenEntry: InterviewScreenEntry | InterviewScreenEntryCreate,
): SerializedInterviewScreenEntryRead | SerializedInterviewScreenEntryCreate {
  return screenEntry;
}

/**
 * Returns an entry corresponding to the given id from a list of entries
 *
 * @param entryId
 * @param entries
 */
export function getEntryById(
  entryId: string,
  entries: InterviewScreenEntry[] | undefined,
): InterviewScreenEntry | undefined {
  if (entries === undefined) {
    return undefined;
  }

  return entries.find(entry => entry.id === entryId);
}

export function getResponseTypeDisplayName(responseType: ResponseType): string {
  switch (responseType) {
    case ResponseType.TEXT:
      return 'Text';
    case ResponseType.NUMBER:
      return 'Number';
    case ResponseType.BOOLEAN:
      return 'Yes/No';
    case ResponseType.EMAIL:
      return 'Email';
    default:
      return assertUnreachable(responseType);
  }
}

/**
 * Convert a responseType as a string to a ResponseType enum. If no matching
 * enum is found, or if the value is `undefined`, then we return
 * `ResponsType.Text` as the default.
 */
export function responseTypeStringToEnum(
  responseTypeString: string | undefined,
): ResponseType {
  const responseTypeEnum = RESPONSE_TYPES.find(
    responseType => responseType === responseTypeString,
  );

  // if we couldn't find a matching enum, set a default
  return responseTypeEnum ?? ResponseType.TEXT;
}

export { ResponseType };
export type { InterviewScreenEntry as T };
export type { InterviewScreenEntryCreate as CreateT };
export type { SerializedInterviewScreenEntryRead as SerializedT };
