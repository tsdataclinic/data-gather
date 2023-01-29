import * as InterviewScreenEntry from './InterviewScreenEntry';
import * as ConditionalAction from './ConditionalAction';
import { SerializedInterviewScreenCreate } from '../api/models/SerializedInterviewScreenCreate';
import { SerializedInterviewScreenRead } from '../api/models/SerializedInterviewScreenRead';
import { SerializedInterviewScreenUpdate } from '../api/models/SerializedInterviewScreenUpdate';
import { SerializedInterviewScreenReadWithChildren } from '../api/models/SerializedInterviewScreenReadWithChildren';
import { Override } from '../util/types';

export type Id = string;

/**
 * A stage of an interview. It consists of entries and conditional actions.
 *
 * This is the serialized type as it is used on the frontend.
 */
interface InterviewScreen {
  /** Description text for the page */
  readonly headerText: string;

  /** The id of this screen. */
  readonly id: Id;

  /** The id of the interview that this screen belongs to */
  readonly interviewId: string;

  /**
   * Whether or not this screen should be in the starting state for an
   * interview's stack.
   */
  readonly isInStartingState: boolean;

  /**
   * Index of the screen in the interview. Undefined when we're creating
   * an interview, this gets set by the database.
   * */
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
  readonly title: { [lang: string]: string };
}

interface InterviewScreenWithChildren extends InterviewScreen {
  /** The actions executed after the page is complete. */
  readonly actions: readonly ConditionalAction.T[];

  /** The entries on this page. */
  readonly entries: readonly InterviewScreenEntry.T[];
}

/**
 * The InterviewScreen model used on a Create request. `id` and `order` are no
 * longer necessary because they get set by the database.
 */
type InterviewScreenCreate = Omit<InterviewScreen, 'id' | 'order'>;

/**
 * The InterviewScreen model used on an update request.
 * InterviewScreen models allow nested updates, so the Update model includes
 * the nested actions and entries.
 *
 * Note that the nested models can also be Create models! So it is possible
 * for an interview screen update to also accept actions or entries that
 * lack ids (because they have yet to be created in the database).
 */
type InterviewScreenUpdate = Override<
  InterviewScreenWithChildren,
  {
    readonly actions: ReadonlyArray<
      ConditionalAction.T | ConditionalAction.CreateT
    >;
    readonly entries: ReadonlyArray<
      InterviewScreenEntry.T | InterviewScreenEntry.CreateT
    >;
  }
>;

/**
 * Create a new empty screen
 */
export function create(values: {
  headerText?: string;
  interviewId: string;
  title: string;
}): InterviewScreenCreate {
  return {
    headerText: values.headerText ?? '',
    title: { en: values.title }, // TODO multilanguage support rather than hardcoding en
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
 * Deserialize a SerializedInterviewScreenRead model.
 */
export function deserialize(
  rawObj: SerializedInterviewScreenReadWithChildren,
): InterviewScreenWithChildren;
export function deserialize(
  rawObj: SerializedInterviewScreenRead,
): InterviewScreen;
export function deserialize(
  rawObj:
    | SerializedInterviewScreenReadWithChildren
    | SerializedInterviewScreenRead,
): InterviewScreen | InterviewScreenWithChildren {
  if ('actions' in rawObj && 'entries' in rawObj) {
    return {
      ...rawObj,
      actions: rawObj.actions?.map(ConditionalAction.deserialize),
      entries: rawObj.entries?.map(InterviewScreenEntry.deserialize),
    };
  }

  return rawObj;
}

/** Serialize an InterviewScreenUpdate or Create model */
export function serialize(
  screen: InterviewScreenUpdate,
): SerializedInterviewScreenUpdate;
export function serialize(
  screen: InterviewScreenCreate,
): SerializedInterviewScreenCreate;
export function serialize(
  screen: InterviewScreenUpdate | InterviewScreenCreate,
): SerializedInterviewScreenCreate | SerializedInterviewScreenUpdate {
  if ('actions' in screen && 'entries' in screen) {
    return {
      ...screen,
      actions: screen.actions?.map(ConditionalAction.serialize),
      entries: screen.entries?.map(InterviewScreenEntry.serialize),
    };
  }
  return screen;
}

export type { InterviewScreen as T };
export type { InterviewScreenWithChildren as WithChildrenT };
export type { InterviewScreenCreate as CreateT };
export type { InterviewScreenUpdate as UpdateT };
export type { SerializedInterviewScreenRead as SerializedT };
