import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a single question asked to the interview subject
 */
export interface T {
  readonly id: string;

  /**  The name to display on the sidebar */
  readonly name: string;

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

/**
 * Create a new screen entry
 */
export function create(values: {
  name: string;
  prompt: string;
  responseType: string;
  text: string;
}): T {
  return {
    id: uuidv4(),
    name: values.name,
    prompt: values.prompt,
    responseId: uuidv4(),
    responseType: values.responseType,
    text: values.text,
  };
}

export function deserialize(rawObj: SerializedT): T {
  return rawObj;
}

/**
 * Convert from deserialized type to serialized
 */
export function serialize(interviewScreen: T): SerializedT {
  return interviewScreen;
}
