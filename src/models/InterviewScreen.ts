import * as InterviewScreenEntry from './InterviewScreenEntry';
import * as ConditionalAction from './ConditionalAction';
import { InterviewScreenWithActionsAndEntries as SerializedInterviewScreen } from '../api/models/InterviewScreenWithActionsAndEntries';

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
  readonly actions: readonly ConditionalAction.T[];

  /** The entries on this page. Represented by an array of entry ids. */
  readonly entries: readonly InterviewScreenEntry.T[];

  /** Description text for the page */
  readonly headerText: string;

  /** The id of this screen */
  readonly id?: string;

  /** The id of the interview that this screen belongs to */
  readonly interviewId: string;

  /**
   * Whether or not this screen should be in the starting state for an
   * interview's stack.
   */
  readonly isInStartingState: boolean;

  /** Index of the screen in the interview */
  readonly order: number;

  /**
   * The index of a screen in the starting state of the interview's stack.
   * This can be different from the `order` of the screen, which is just the
   * index of the screen within the interview configuration UI.
   *
   * `startingStateOrder` is undefined if `isInStartingState` is false.
   */
  readonly startingStateOrder?: number;

  /** Title of the page */
  readonly title: string;
}

/**
 * Create a new empty screen
 */
export function create(values: {
  headerText?: string;
  interviewId: string;
  order: number;
  title: string;
}): InterviewScreen {
  return {
    actions: [],
    entries: [],
    headerText: values.headerText ?? '',
    title: values.title,
    order: values.order,
    isInStartingState: false,
    interviewId: values.interviewId,
  };
}

export function update(
  original: InterviewScreen,
  newValues: Pick<InterviewScreen, 'headerText' | 'title'>,
): InterviewScreen {
  return {
    ...original,
    ...newValues,
    id: original.id,
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
    entries: screen.entries.concat(entry),
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
    actions: screen.actions.concat(conditionalAction),
  };
}

/**
 * Immutably removes an entry from a screen
 */
export function removeEntry(
  screen: InterviewScreen,
  entry: InterviewScreenEntry.T,
): InterviewScreen {
  const index = screen.entries.findIndex(e => e.id === entry.id);
  if (index > -1)
    return {
      ...screen,
      entries: [
        ...screen.entries.slice(0, index),
        ...screen.entries.slice(index + 1),
      ],
    };
  return screen;
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(
  rawObj: SerializedInterviewScreen,
): InterviewScreen {
  return {
    ...rawObj,
    actions: rawObj.actions.map(ConditionalAction.deserialize),
    entries: rawObj.entries.map(InterviewScreenEntry.deserialize),
  };
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(
  interviewScreen: InterviewScreen,
): SerializedInterviewScreen {
  return {
    ...interviewScreen,
    actions: interviewScreen.actions.map(ConditionalAction.serialize),
    entries: interviewScreen.entries.map(InterviewScreenEntry.serialize),
  };
}

export type { InterviewScreen as T };
export type { SerializedInterviewScreen as SerializedT };
