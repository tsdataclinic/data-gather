/**
 * Represents a single question asked to the interview subject
 */
interface InterviewScreenEntry {
  readonly id: string;

  /**  The text of the question */
  readonly prompt: string;

  /** The id associated with the resposnse to the question */
  readonly responseId: string;

  /** The data type expected as a response */
  readonly responseType: string;

  /** The screen that this entry belongs to */
  readonly screenId: string;

  /** Additional flavor text associated with the question */
  readonly text: string;
}

type SerializedInterviewScreenEntry = InterviewScreenEntry;

export function deserialize(
  rawObj: SerializedInterviewScreenEntry,
): InterviewScreenEntry {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(
  interviewScreen: InterviewScreenEntry,
): SerializedInterviewScreenEntry {
  return interviewScreen;
}

export type { InterviewScreenEntry as T };
export type { SerializedInterviewScreenEntry as SerializedT };
