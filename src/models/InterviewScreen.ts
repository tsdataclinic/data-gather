import { v4 as uuidv4 } from 'uuid';

/**
 * A group of entries, corresponding to a particular state in the interview.
 *
 * This is the serialized type as it is used on the frontend.
 */
export type T = Readonly<{
  /**
   * The actions executed after the page is complete.
   * Represented by an array of action types.
   */
  actions: readonly string[];

  /** The entries on this page. Represented by an array of entry ids. */
  entries: readonly string[];

  /** Description text for the page */
  headerText: string;

  /** The id of this screen */
  id: string;

  /** Title of the page */
  title: string;
}>;

/**
 * This is the serialized type as it is stored on the backend.
 */
export type SerializedT = {
  actions: string[];
  entries: string[];
  headerText: string;
  id: string;
  title: string;
};

/**
 * Create a new empty screen
 */
export function create(values: { title: string }): T {
  return {
    actions: [],
    entries: [],
    headerText: '',
    id: uuidv4(),
    title: values.title,
  };
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(rawObj: SerializedT): T {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interviewScreen: T): SerializedT {
  return {
    ...interviewScreen,
    actions: [...interviewScreen.actions],
    entries: [...interviewScreen.entries],
  };
}
