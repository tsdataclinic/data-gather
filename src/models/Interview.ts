import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import * as InterviewScreen from './InterviewScreen';

/**
 * Represents all the data associated with interview flow.
 *
 * This is the serialized type as it is used on the frontend.
 */
interface Interview {
  readonly createdDate: DateTime;
  readonly description: string;
  readonly id: string;
  readonly name: string;

  /** Array of screen ids */
  readonly screens: readonly string[];

  /** Array of starting screen ids */
  readonly startingState: readonly string[];
}

/**
 * This is the serialized type as it is stored on the backend.
 */
interface SerializedInterview {
  createdDate: number;
  description: string;
  id: string;
  name: string;
  screens: string[];
  startingState: string[];
}

/**
 * Returns a URL which can be used to execute a given interview.
 * see: routes in App.tsx
 */
export function getRunUrl(interview: Interview): string {
  return `/interview/${interview.id}/run`;
}

/**
 * Create a new empty interview
 */
export function create(values: {
  description: string;
  name: string;
}): Interview {
  return {
    createdDate: DateTime.now(),
    description: values.description,
    id: uuidv4(),
    name: values.name,
    screens: [],
    startingState: [],
  };
}

/**
 * Immutably add a screen to an interview
 */
export function addScreen(
  interview: Interview,
  screen: InterviewScreen.T,
): Interview {
  return {
    ...interview,
    screens: interview.screens.concat(screen.id),
  };
}

/**
 * Immutably add a starting screen to a particular position
 * in the interview's default sequence
 */
export function addStartingScreen(
  interview: Interview,
  screenId: string,
): Interview {
  return {
    ...interview,
    startingState: [...interview.startingState, screenId],
  };
}

/**
 * Immutably update a starting screen at a particular position
 * in the interview's default sequence
 */
export function updateStartingScreen(
  interview: Interview,
  index: number,
  screenId: string,
): Interview {
  return {
    ...interview,
    startingState: [
      ...interview.startingState.slice(0, index),
      screenId,
      ...interview.startingState.slice(index + 1),
    ],
  };
}

/**
 * Immutably remove a starting screen from a particular position
 * in the interview's default sequence
 */
export function removeStartingScreen(
  interview: Interview,
  index: number,
): Interview {
  return {
    ...interview,
    startingState: [
      ...interview.startingState.slice(0, index),
      ...interview.startingState.slice(index + 1),
    ],
  };
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(rawObj: SerializedInterview): Interview {
  return {
    ...rawObj,
    createdDate: DateTime.fromMillis(rawObj.createdDate),
  };
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interview: Interview): SerializedInterview {
  return {
    ...interview,
    createdDate: interview.createdDate.toMillis(),
    screens: [...interview.screens],
    startingState: [...interview.startingState],
  };
}

export type { Interview as T };
export type { SerializedInterview as SerializedT };
