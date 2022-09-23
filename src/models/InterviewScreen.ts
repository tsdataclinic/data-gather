import { v4 as uuidv4 } from 'uuid';
import * as InterviewScreenEntry from './InterviewScreenEntry';
import * as ConditionalAction from './ConditionalAction';

/**
 * A group of entries, corresponding to a particular state in the interview.
 *
 * This is the serialized type as it is used on the frontend.
 */
interface InterviewScreen {
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
interface SerializedInterviewScreen {
  actions: string[];
  entries: string[];
  headerText: string;
  id: string;
  title: string;
}

/**
 * Create a new empty screen
 */
export function create(values: { title: string }): InterviewScreen {
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
export function addEntry(
  screen: InterviewScreen,
  entry: InterviewScreenEntry.T,
): InterviewScreen {
  return {
    ...screen,
    entries: screen.entries.concat(entry.id),
  };
}

/**
 * Immutably add an action to a screen
 */
export function addAction(
  screen: InterviewScreen,
  conditionalAction: ConditionalAction.T,
): InterviewScreen {
  return {
    ...screen,
    actions: screen.actions.concat(conditionalAction.id),
  };
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(
  rawObj: SerializedInterviewScreen,
): InterviewScreen {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(
  interviewScreen: InterviewScreen,
): SerializedInterviewScreen {
  return {
    ...interviewScreen,
    actions: [...interviewScreen.actions],
    entries: [...interviewScreen.entries],
  };
}

export type { InterviewScreen as T };
export type { SerializedInterviewScreen as SerializedT };
