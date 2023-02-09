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
  /** Map from language to description text for the page, in that language */
  readonly headerText: { [lang: string]: string };

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

  /** Map from language to title of the page in that language */
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

export const QueryKeys = {
  getScreens: (interviewId: string | undefined) => [
    'interviewScreens',
    interviewId,
  ],
};

/**
 * Create a new empty screen
 */
export function create(values: {
  defaultLanguage: string;
  headerText?: string;
  interviewId: string;
  isInStartingState?: boolean;
  startingStateOrder?: number;
  title: string;
}): InterviewScreenCreate {
  const {
    defaultLanguage,
    headerText,
    isInStartingState,
    title,
    startingStateOrder,
    interviewId,
  } = values;
  return {
    startingStateOrder,
    interviewId,
    headerText: { [defaultLanguage]: headerText ?? '' },
    title: { [defaultLanguage]: title },
    isInStartingState: isInStartingState ?? false,
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

/**
 * Get this screen's title in a given language.
 */
export function getTitle(screen: InterviewScreen, language: string): string {
  const { title: titleObj } = screen;
  if (language in titleObj) {
    return titleObj[language];
  }

  // otherwise default to the title in the first language we find
  return titleObj[Object.keys(titleObj)[0]];
}

export function getURL(screen: InterviewScreen): string {
  return `/interview/${screen.interviewId}/screen/${screen.id}`;
}

export type { InterviewScreen as T };
export type { InterviewScreenWithChildren as WithChildrenT };
export type { InterviewScreenCreate as CreateT };
export type { InterviewScreenUpdate as UpdateT };
export type { SerializedInterviewScreenRead as SerializedT };
