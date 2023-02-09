import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import { SerializedInterviewScreenEntryRead } from '../api/models/SerializedInterviewScreenEntryRead';
import { SerializedInterviewScreenEntryCreate } from '../api/models/SerializedInterviewScreenEntryCreate';
import { ResponseType } from '../api/models/ResponseType';
import type * as InterviewScreen from './InterviewScreen';
import { SerializedInterviewScreenEntryReadWithScreen } from '../api/models/SerializedInterviewScreenEntryReadWithScreen';

const AirtableOptionsSchema = z.object({
  selectedBase: z.string(),
  selectedFields: z.string().array(),
  selectedTable: z.string(),
});

const SelectionOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
});

const SingleSelectOptionsSchema = z.object({
  options: SelectionOptionSchema.array(),

  // If an airtable config is provided then we will pull the options from the
  // given airtable field rather than using the manually specified `options`
  airtableConfig: AirtableOptionsSchema.optional(),
});

export type AirtableOptions = Readonly<z.infer<typeof AirtableOptionsSchema>>;
export type SelectionOption = Readonly<z.infer<typeof SelectionOptionSchema>>;
export type SingleSelectOptions = Readonly<
  z.infer<typeof SingleSelectOptionsSchema>
>;

export const RESPONSE_TYPES: readonly ResponseType[] =
  Object.values(ResponseType);

export type Id = string;

/**
 * Represents a single question asked to the interview subject
 */
type InterviewScreenEntry = {
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

  /** The screen that this entry belongs to */
  readonly screenId: string;

  /** Map from language to additional flavor text associated with the question, in that language */
  readonly text: { [language: string]: string };
} & (
  | {
      readonly responseType: ResponseType.AIRTABLE;
      readonly responseTypeOptions: AirtableOptions;
    }
  | {
      readonly responseType: ResponseType.SINGLE_SELECT;
      readonly responseTypeOptions: SingleSelectOptions;
    }
  | {
      // these response types don't have any configurable `responseTypeOptions`
      readonly responseType:
        | ResponseType.BOOLEAN
        | ResponseType.EMAIL
        | ResponseType.NUMBER
        | ResponseType.PHONE_NUMBER
        | ResponseType.TEXT;
      readonly responseTypeOptions: undefined;
    }
);

type InterviewScreenEntryWithScreen = InterviewScreenEntry & {
  readonly screen: InterviewScreen.T;
};

// replace the id using this weird conditional expression because it's the only
// way typescript correctly distributes operations while preserving
// discriminants in unions
type ReplaceIdSafely<T> = T extends unknown
  ? Omit<T, 'id'> & {
      /**
       * A temp id used only for identification purposes in the frontend (e.g.
       * for React keys)
       */
      tempId: string;
    }
  : never;

type InterviewScreenEntryCreate = ReplaceIdSafely<InterviewScreenEntry>;

function createDefaultAirtableOptions(): AirtableOptions {
  return {
    selectedBase: '',
    selectedFields: [],
    selectedTable: '',
  };
}

function createDefaultSingleSelectOptions(): SingleSelectOptions {
  return { options: [] };
}

export function deserialize(
  rawObj: SerializedInterviewScreenEntryRead,
): InterviewScreenEntry {
  // parse the response type options correctly depending on the responseType
  const { responseType, responseTypeOptions, ...restOfObj } = rawObj;
  switch (responseType) {
    case ResponseType.AIRTABLE:
      return {
        ...restOfObj,
        responseType,
        responseTypeOptions: AirtableOptionsSchema.parse(responseTypeOptions),
      };
    case ResponseType.SINGLE_SELECT:
      return {
        ...restOfObj,
        responseType,
        responseTypeOptions:
          SingleSelectOptionsSchema.parse(responseTypeOptions),
      };
    case ResponseType.BOOLEAN:
    case ResponseType.TEXT:
    case ResponseType.EMAIL:
    case ResponseType.NUMBER:
    case ResponseType.PHONE_NUMBER:
      return {
        ...restOfObj,
        responseType,
        responseTypeOptions: undefined,
      };
    default:
      return assertUnreachable(responseType);
  }
}

export function deserializeWithScreen(
  rawObj: SerializedInterviewScreenEntryReadWithScreen,
): InterviewScreenEntryWithScreen {
  const { screen, ...restOfEntry } = rawObj;
  const deserializedEntry = deserialize(restOfEntry);
  return {
    ...deserializedEntry,
    screen, // no extra deserialization needed for the screen
  };
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
      return 'Airtable lookup';
    case ResponseType.TEXT:
      return 'Text';
    case ResponseType.NUMBER:
      return 'Number';
    case ResponseType.BOOLEAN:
      return 'Yes/No';
    case ResponseType.EMAIL:
      return 'Email';
    case ResponseType.PHONE_NUMBER:
      return 'Phone number';
    case ResponseType.SINGLE_SELECT:
      return 'Single select';
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

export function changeResponseType<
  Entry extends InterviewScreenEntry | InterviewScreenEntryCreate,
>(entry: Entry, newResponseType: ResponseType): Entry {
  switch (newResponseType) {
    case ResponseType.AIRTABLE:
      return {
        ...entry,
        responseType: newResponseType,
        responseTypeOptions: createDefaultAirtableOptions(),
      };
    case ResponseType.SINGLE_SELECT:
      return {
        ...entry,
        responseType: newResponseType,
        responseTypeOptions: createDefaultSingleSelectOptions(),
      };
    case ResponseType.TEXT:
    case ResponseType.EMAIL:
    case ResponseType.NUMBER:
    case ResponseType.PHONE_NUMBER:
    case ResponseType.BOOLEAN:
      return {
        ...entry,
        responseType: newResponseType,
        responseTypeOptions: undefined,
      };
    default:
      return assertUnreachable(newResponseType);
  }
}

export function create(
  values: Omit<
    InterviewScreenEntry,
    'id' | 'responseKey' | 'tempId' | 'responseTypeOptions'
  >,
): InterviewScreenEntryCreate {
  const defaultEntry: InterviewScreenEntryCreate = {
    ...values,
    responseKey: uuidv4(),
    tempId: uuidv4(),
    responseType: ResponseType.TEXT,
    responseTypeOptions: undefined,
  };

  return changeResponseType(defaultEntry, values.responseType);
}

export { ResponseType };
export type { InterviewScreenEntry as T };
export type { InterviewScreenEntryWithScreen as WithScreenT };
export type { InterviewScreenEntryCreate as CreateT };
export type { SerializedInterviewScreenEntryRead as SerializedT };
