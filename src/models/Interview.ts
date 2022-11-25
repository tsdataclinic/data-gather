import { DateTime } from 'luxon';
import * as InterviewScreen from './InterviewScreen';
import { Interview as SerializedInterviewBase } from '../api/models/Interview';

/**
 * Represents all the metadata data for an interview.
 *
 * This is the serialized type as it is used on the frontend.
 */
interface Interview {
  /**
   * The date when this interview was created. Undefined only when creating
   * because this value is assigned by the database on creation.
   */
  readonly createdDate?: DateTime;
  readonly description: string;

  /**
   * The interview's uuid. Undefined only when creating because this value
   * is assigned by the database on creation.
   */
  readonly id?: string;
  readonly name: string;
  readonly notes: string;

  /**
   * The screens that belong to this interview. Undefined if the screens
   * have not been loaded.
   */
  readonly screens?: InterviewScreen.T[];
}

interface SerializedInterview extends SerializedInterviewBase {
  screens?: InterviewScreen.SerializedT[];
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
    description: values.description,
    name: values.name,
    notes: '',
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
    screens: interview.screens?.concat(screen),
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

export function updateNotes(interview: Interview, notes: string): Interview {
  return {
    ...interview,
    notes,
  };
}

/**
 * Convert from serialized type to deserialized
 */
export function deserialize(rawObj: SerializedInterview): Interview {
  return {
    ...rawObj,
    createdDate: rawObj.createdDate
      ? DateTime.fromISO(rawObj.createdDate)
      : undefined,
    screens: rawObj.screens?.map(InterviewScreen.deserialize),
  };
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interview: Interview): SerializedInterview {
  return {
    ...interview,
    createdDate: interview.createdDate?.toISO(),
    screens: interview.screens?.map(InterviewScreen.serialize),
  };
}

export type { Interview as T };
export type { SerializedInterview as SerializedT };
