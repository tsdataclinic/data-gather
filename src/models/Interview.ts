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
