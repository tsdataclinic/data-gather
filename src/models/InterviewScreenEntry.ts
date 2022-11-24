import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import { InterviewScreenEntryBase as SerializedInterviewScreenEntry } from '../api/models/InterviewScreenEntryBase';
import { ResponseType } from '../api/models/ResponseType';

export const RESPONSE_TYPES: readonly ResponseType[] =
  Object.values(ResponseType);

/**
 * Represents a single question asked to the interview subject
 */
interface InterviewScreenEntry {
  readonly id?: string;

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

export function deserialize(
  rawObj: SerializedInterviewScreenEntry,
): InterviewScreenEntry {
  return rawObj;
}

export function create(
  values: Omit<InterviewScreenEntry, 'id' | 'responseKey'>,
): InterviewScreenEntry {
  return {
    id: uuidv4(),
    name: values.name,
    prompt: values.prompt,
    responseKey: uuidv4(),
    responseType: values.responseType,
    screenId: values.screenId,
    text: values.text,
    order: values.order,
  };
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(
  interviewScreen: InterviewScreenEntry,
): SerializedInterviewScreenEntry {
  return interviewScreen;
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

export type { InterviewScreenEntry as T };
export type { SerializedInterviewScreenEntry as SerializedT };
export type { ResponseType };
