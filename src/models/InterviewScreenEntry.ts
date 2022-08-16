/**
 * Represents a single question asked to the interview subject
 */
export interface T {
  readonly id: string;

  /**  The text of the question */
  readonly prompt: string;

  /** The id associated with the resposnse to the question */
  readonly responseId: string;

  /** The data type expected as a response */
  readonly responseType: string;

  /** Additional flavor text associated with the question */
  readonly text: string;
}

export type SerializedT = T;

export function deserialize(rawObj: SerializedT): T {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interviewScreen: T): SerializedT {
  return interviewScreen;
}
