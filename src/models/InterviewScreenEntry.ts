import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import { SerializedInterviewScreenEntryRead } from '../api/models/SerializedInterviewScreenEntryRead';
import { SerializedInterviewScreenEntryCreate } from '../api/models/SerializedInterviewScreenEntryCreate';
import { ResponseType } from '../api/models/ResponseType';
import type * as InterviewScreen from './InterviewScreen';
import { SerializedInterviewScreenEntryReadWithScreen } from '../api/models/SerializedInterviewScreenEntryReadWithScreen';

export type AirtableOptions = {
  selectedBase: string;
  selectedFields: string[];
  selectedTable: string;
};

export type ResponseTypeOptions = AirtableOptions;

export const RESPONSE_TYPES: readonly ResponseType[] =
  Object.values(ResponseType);

export type Id = string;

/**
 * Represents a single question asked to the interview subject
 */
interface InterviewScreenEntry {
  readonly id: Id;

  /**  The name to display on the sidebar */
  readonly name: string;

  /** The index of this entry in the screen */
  readonly order: number;

  /**  A map from language to the text of the question, in that language */
  readonly prompt: { [language: string]: string };

  /** A boolean indicating whether the entry must have a response */
  readonly required?: boolean;

  /**
   * The key associated with the response to the question
   *
   * Response keys are unique. For now, response keys are not user-editable.
   * So in practice a `responseKey` is just another type of id. It's unclear if
   * we should keep this rather than just use `id` instead. But until a decision
   * is made on that we will continue to generate a unique `responseKey` and
   * store the `responseKey` in the response data when an interview response is
   * submitted.
   */
  readonly responseKey: string;

  /** The data type expected as a response */
  readonly responseType: ResponseType;

  // TODO: extend this to support response configs for other response types
  // and not just airtable
  readonly responseTypeOptions: ResponseTypeOptions;

  /** The screen that this entry belongs to */
  readonly screenId: string;

  /** Map from language to additional flavor text associated with the question, in that language */
  readonly text: { [language: string]: string };
}

interface InterviewScreenEntryWithScreen extends InterviewScreenEntry {
  readonly screen: InterviewScreen.T;
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
    responseTypeOptions: values.responseTypeOptions,
  };
}

export function createDefaultAirtableOptions(): AirtableOptions {
  return {
    selectedBase: '',
    selectedFields: [],
    selectedTable: '',
  };
}

export function deserialize(
  rawObj: SerializedInterviewScreenEntryRead,
): InterviewScreenEntry {
  return rawObj;
}

export function deserializeWithScreen(
  rawObj: SerializedInterviewScreenEntryReadWithScreen,
): InterviewScreenEntryWithScreen {
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
): SerializedInterviewScreenEntryRead | SerializedInterviewScreenEntryCreate;
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
    case ResponseType.AIRTABLE:
      return 'Airtable Lookup';
    case ResponseType.TEXT:
      return 'Text';
    case ResponseType.NUMBER:
      return 'Number';
    case ResponseType.BOOLEAN:
      return 'Yes/No';
    case ResponseType.EMAIL:
      return 'Email';
    case ResponseType.PHONE_NUMBER:
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
  return responseTypeEnum ?? ResponseType.TEXT;
}

export function isCreateType(
  entry: InterviewScreenEntry | InterviewScreenEntryCreate,
): entry is InterviewScreenEntryCreate {
  return 'tempId' in entry;
}

export function getId(
  entry: InterviewScreenEntry | InterviewScreenEntryCreate,
): string {
  return isCreateType(entry) ? entry.tempId : entry.id;
}

export { ResponseType };
export type { InterviewScreenEntry as T };
export type { InterviewScreenEntryWithScreen as WithScreenT };
export type { InterviewScreenEntryCreate as CreateT };
export type { SerializedInterviewScreenEntryRead as SerializedT };
