import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import * as InterviewScreen from './InterviewScreen';

/**
 * Represents all the data associated with interview flow.
 *
 * This is the serialized type as it is used on the frontend.
 */
export type T = Readonly<{
  createdDate: DateTime;
  description: string;
  id: string;
  name: string;

  /** Array of screen ids */
  screens: readonly string[];

  /** Array of starting screen ids */
  startingState: readonly string[];
}>;

/**
 * This is the serialized type as it is stored on the backend.
 */
export type SerializedT = {
  createdDate: number;
  description: string;
  id: string;
  name: string;
  screens: string[];
  startingState: string[];
};

/**
 * Create a new empty interview
 */
export function create(values: { description: string; name: string }): T {
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
export function addScreen(interview: T, screen: InterviewScreen.T): T {
  return {
    ...interview,
    screens: interview.screens.concat(screen.id),
  };
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(rawObj: SerializedT): T {
  return {
    ...rawObj,
    createdDate: DateTime.fromMillis(rawObj.createdDate),
  };
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interview: T): SerializedT {
  return {
    ...interview,
    createdDate: interview.createdDate.toMillis(),
    screens: [...interview.screens],
    startingState: [...interview.startingState],
  };
}
