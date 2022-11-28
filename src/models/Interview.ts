import { DateTime } from 'luxon';
import * as InterviewScreen from './InterviewScreen';
import { SerializedInterviewRead } from '../api/models/SerializedInterviewRead';
import { SerializedInterviewCreate } from '../api/models/SerializedInterviewCreate';
import { SerializedInterviewUpdate } from '../api/models/SerializedInterviewUpdate';
import { SerializedInterviewReadWithScreens } from '../api/models/SerializedInterviewReadWithScreens';

/**
 * All the metadata data for an interview.
 */
interface Interview {
  readonly createdDate: DateTime;
  readonly description: string;
  readonly id: string;
  readonly name: string;
  readonly notes: string;
}

/**
 * Interview model with its associated screens loaded.
 */
interface InterviewWithScreens extends Interview {
  readonly screens: InterviewScreen.T[];
}

/**
 * The Interview model used during creation.
 * `id` and `createdDate` are removed because they get set by the database.
 */
type InterviewCreate = Omit<Interview, 'id' | 'createdDate'>;

/**
 * The Interview model used during an update request.
 */
type InterviewUpdate = Interview;

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
}): InterviewCreate {
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
 * Deserialize a SerializedInterviewRead model from the backend.
 */
export function deserialize(
  rawObj: SerializedInterviewReadWithScreens,
): InterviewWithScreens;
export function deserialize(rawObj: SerializedInterviewRead): Interview;
export function deserialize(
  rawObj: SerializedInterviewRead | SerializedInterviewReadWithScreens,
): Interview | InterviewWithScreens {
  const datetime = DateTime.fromISO(rawObj.createdDate);

  if ('screens' in rawObj) {
    return {
      ...rawObj,
      createdDate: datetime,
      screens: rawObj.screens?.map(InterviewScreen.deserialize),
    };
  }

  return {
    ...rawObj,
    createdDate: datetime,
  };
}

/** Serialize an InterviewUpdate or Create model */
export function serialize(
  interview: InterviewUpdate,
): SerializedInterviewUpdate;
export function serialize(
  interview: InterviewCreate,
): SerializedInterviewCreate;
export function serialize(
  interview: InterviewUpdate | InterviewCreate,
): SerializedInterviewCreate | SerializedInterviewUpdate {
  if ('createdDate' in interview) {
    return {
      ...interview,
      createdDate: interview.createdDate?.toISO(),
    };
  }
  return interview;
}

export type { Interview as T };
export type { InterviewWithScreens as WithScreensT };
export type { InterviewCreate as CreateT };
export type { InterviewUpdate as UpdateT };
export type { SerializedInterviewRead as SerializedT };
