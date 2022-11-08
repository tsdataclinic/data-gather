import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';

export enum ResponseType {
  Airtable = 'Airtable',
  Boolean = 'BOOLEAN',
  Email = 'EMAIL',
  Number = 'NUMBER',
  PhoneNumber = 'PHONE_NUMBER',
  Text = 'TEXT',
}

export type ResponseTypeOptions = {
  selectedBase: string;
  selectedFields: string[];
  selectedTable: string;
};

export const RESPONSE_TYPES: readonly ResponseType[] =
  Object.values(ResponseType);

/**
 * Represents a single question asked to the interview subject
 */
interface InterviewScreenEntry {
  readonly id: string;

  /**  The name to display on the sidebar */
  readonly name: string;

  /**  The text of the question */
  readonly prompt: string;

  /** The id associated with the resposnse to the question */
  readonly responseId: string;

  /** The data type expected as a response */
  readonly responseType: ResponseType;

  readonly responseTypeOptions: ResponseTypeOptions;

  /** The screen that this entry belongs to */
  readonly screenId: string;

  /** Additional flavor text associated with the question */
  readonly text: string;
}

type SerializedInterviewScreenEntry = InterviewScreenEntry;

export function deserialize(
  rawObj: SerializedInterviewScreenEntry,
): InterviewScreenEntry {
  return rawObj;
}

export function create(
  values: Omit<InterviewScreenEntry, 'id' | 'responseId'>,
): InterviewScreenEntry {
  return {
    id: uuidv4(),
    name: values.name,
    prompt: values.prompt,
    responseId: uuidv4(),
    responseType: values.responseType,
    responseTypeOptions: values.responseTypeOptions,
    screenId: values.screenId,
    text: values.text,
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
    case ResponseType.Airtable:
      return 'Airtable';
    case ResponseType.Text:
      return 'Text';
    case ResponseType.Number:
      return 'Number';
    case ResponseType.Boolean:
      return 'Yes/No';
    case ResponseType.Email:
      return 'Email';
    case ResponseType.PhoneNumber:
      return 'Phone Number';
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
  return responseTypeEnum ?? ResponseType.Text;
}

export type { InterviewScreenEntry as T };
export type { SerializedInterviewScreenEntry as SerializedT };
