import { v4 as uuidv4 } from 'uuid';
import * as InterviewScreenEntry from './InterviewScreenEntry';

/**
 * A group of entries, corresponding to a particular state in the interview.
 *
 * This is the serialized type as it is used on the frontend.
 */
export interface T {
  /**
   * The actions executed after the page is complete.
   * Represented by an array of action types.
   */
  readonly actions: readonly string[];

  /** The entries on this page. Represented by an array of entry ids. */
  readonly entries: readonly string[];

  /** Description text for the page */
  readonly headerText: string;

  /** The id of this screen */
  readonly id: string;

  /** Title of the page */
  readonly title: string;
}

/**
 * This is the serialized type as it is stored on the backend.
 */
export interface SerializedT {
  actions: string[];
  entries: string[];
  headerText: string;
  id: string;
  title: string;
}

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
 * Immutably add an entry to a screen
 */
export function addEntry(screen: T, entry: InterviewScreenEntry.T): T {
  return {
    ...screen,
    entries: screen.entries.concat(entry.id),
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
