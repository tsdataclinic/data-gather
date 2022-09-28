import Dexie, { Table } from 'dexie';
import invariant from 'invariant';
import { createContext } from 'react';
import * as ConditionalAction from '../models/ConditionalAction';
import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import isNonNullable from '../util/isNonNullable';

/**
 * This API interacts with the browser storage backend.
 *
 * All functions here should return deserialized models. Meaning, they
 * should be translated from their backend representation to a usable
 * frontend representation. For example, any dates as numerical timestamps
 * should be converted to Date objects before returning.
 */
export class InterviewStoreAPI extends Dexie {
  private conditionalActions!: Table<ConditionalAction.SerializedT>;

  private interviews!: Table<Interview.SerializedT>;

  private interviewScreens!: Table<InterviewScreen.SerializedT>;

  private interviewScreenEntries!: Table<InterviewScreenEntry.SerializedT>;

  constructor() {
    super('DataClinicInterviewApp');

    // id is our primary key
    this.version(1).stores({
      conditionalActions: '++id',
      interviewScreenEntries: '++id',
      interviewScreens: '++id',
      interviews: '++id',
    });
  }

  /**
   * Create a new empty interview
   * @param {string} name
   * @param {string} description
   */
  createInterview = async (
    name: string,
    description: string,
  ): Promise<Interview.T> => {
    const newInterview = Interview.create({ description, name });
    await this.interviews.add(Interview.serialize(newInterview));
    return newInterview;
  };

  /**
   * Get all interview ids
   * @returns {string[]} Array of all interview IDs
   */
  getInterviewIds = async (): Promise<string[]> => {
    const interviews = await this.interviews.toArray();
    return interviews.map(row => row.id);
  };

  /**
   * Get all interviews
   * @returns {Interview.T[]} Array of interview objects
   */
  getAllInterviews = async (): Promise<Interview.T[]> => {
    const serializedInterviews = await this.interviews.toArray();
    return serializedInterviews.map(Interview.deserialize);
  };

  /**
   * Get an interview by their id.
   *
   * @param {string} id
   * @returns {Interview.T | undefined} The Interview object, or undefined if
   * not found.
   */
  getInterview = async (id: string): Promise<Interview.T | undefined> => {
    const interview = await this.interviews.get(id);
    if (interview) {
      return Interview.deserialize(interview);
    }
    return undefined;
  };

  /**
   * Get a screen by their id.
   *
   * @param {string} id
   * @returns {InterviewScreen.T | undefined} The InterviewScreen object, or
   * undefined if not found.
   */
  getScreen = async (id: string): Promise<InterviewScreen.T | undefined> => {
    const screen = await this.interviewScreens.get(id);
    if (screen) {
      return InterviewScreen.deserialize(screen);
    }
    return undefined;
  };

  /**
   * Get screens by their ids.
   *
   * @param {string[]} screenIds
   * @returns {InterviewScreen.T[]} Array of interview screens
   */
  private getScreens = async (
    screenIds: readonly string[],
  ): Promise<InterviewScreen.T[]> => {
    const screens = (
      await this.interviewScreens.bulkGet([...screenIds])
    ).filter(isNonNullable);
    return screens.map(InterviewScreen.deserialize);
  };

  /**
   * Get all screens of an interview, given the interview id.
   *
   * @param {string} interviewId
   * @returns {InterviewScreen.T[]} Array of interview screens
   */
  getScreensOfInterview = async (
    interviewId: string,
  ): Promise<InterviewScreen.T[]> => {
    const interview = await this.getInterview(interviewId);
    return interview ? this.getScreens(interview.screens) : [];
  };

  /**
   * Get screen entries by their ids.
   *
   * @param {string[]} entryIds
   * @returns {InterviewScreen.T[]} Array of interview screens
   */
  getScreenEntries = async (
    entryIds: readonly string[],
  ): Promise<InterviewScreenEntry.T[]> => {
    const entries = (
      await this.interviewScreenEntries.bulkGet([...entryIds])
    ).filter(isNonNullable);
    return entries.map(InterviewScreenEntry.deserialize);
  };

  /**
   * Get all screen entries of an interview, given the interview id.
   *
   * @param {string} interviewId
   * @returns {InterviewScreenEntry.T[]} Array of interview screen entries
   */
  getScreenEntriesOfInterview = async (
    interviewId: string,
  ): Promise<InterviewScreenEntry.T[]> => {
    const screens = await this.getScreensOfInterview(interviewId);
    return this.getScreenEntries(screens.flatMap(screen => screen.entries));
  };

  /**
   * Get conditional actions by their ids.
   *
   * @param {string[]} actionIds
   * @returns {ConditionalAction.T[]} Array of interview conditional actions
   */
  private getConditionalActions = async (
    actionIds: readonly string[],
  ): Promise<ConditionalAction.T[]> => {
    const actions = (
      await this.conditionalActions.bulkGet([...actionIds])
    ).filter(isNonNullable);
    return actions.map(ConditionalAction.deserialize);
  };

  /**
   * Get all conditional actions of an interview, given the interview id.
   *
   * @param {string} interviewId
   * @returns {ConditionalAction.T[]>} Array of interview conditional actions
   */
  getConditionalActionsOfInterview = async (
    interviewId: string,
  ): Promise<ConditionalAction.T[]> => {
    const screens = await this.getScreensOfInterview(interviewId);
    return this.getConditionalActions(
      screens.flatMap(screen => screen.actions),
    );
  };

  /**
   * If this interview already exists, update it. Otherwise, add it.
   * @param {Interview.T} interview
   * @returns {Interview.T} the updated interview
   */
  putInterview = async (interview: Interview.T): Promise<Interview.T> => {
    await this.interviews.put(Interview.serialize(interview));
    return interview;
  };

  /**
   * If this screen already exists, update it. Otherwise, add it.
   *
   * NOTE: if this is a new screen that doesn't exist in an interview yet, you
   * should call `addScreenToInterview` instead.
   *
   * @param {InterviewScreen.T} screen
   * @returns {InterviewScreen.T} the updated interview screen
   */
  putScreen = async (screen: InterviewScreen.T): Promise<InterviewScreen.T> => {
    await this.interviewScreens.put(InterviewScreen.serialize(screen));
    return screen;
  };

  /**
   * If this InterviewScreenEntry already exists, update it. Otherwise, add it.
   *
   * NOTE: if this is a new InterviewScreenEntry that doesn't exist in a screen yet,
   * you should call `addEntryToScreen` instead.
   *
   * @param {InterviewScreenEntry.T} screenEntry The screen entry to add
   * @returns {InterviewScreenEntry.T} the updated interview screen entry
   */
  putScreenEntry = async (
    screenEntry: InterviewScreenEntry.T,
  ): Promise<InterviewScreenEntry.T> => {
    await this.interviewScreenEntries.put(
      InterviewScreenEntry.serialize(screenEntry),
    );
    return screenEntry;
  };

  deleteScreenEntry = async (
    screenEntry: InterviewScreenEntry.T,
  ): Promise<string> => {
    const entryId = screenEntry.id;
    await this.interviewScreenEntries.delete(entryId);
    return entryId;
  };

  putScreenAction = async (
    conditionalAction: ConditionalAction.T,
  ): Promise<ConditionalAction.T> => {
    await this.conditionalActions.put(
      ConditionalAction.serialize(conditionalAction),
    );
    return conditionalAction;
  };

  /**
   * Delete an interview given their id
   * This will delete all associated objects to this interview.
   * That includes their associated screens, entries, and conditional actions
   *
   * @param {string} interviewId
   */
  deleteInterview = async (interviewId: string): Promise<void> => {
    // first, get the interview by id
    const interview = await this.getInterview(interviewId);

    if (interview) {
      // get all screen ids to delete
      const screenIds = [...interview.screens];

      // get all screens (to then get entries and conditional actions)
      const screens = await this.getScreens(screenIds);

      // get all entry ids to delete
      const entryIds = screens.flatMap(screen => screen.entries);
      const actionIds = screens.flatMap(screen => screen.actions);

      // now delete all screens, entries, actions, and the interview itself
      await Promise.all([
        this.conditionalActions.bulkDelete(actionIds),
        this.interviewScreenEntries.bulkDelete(entryIds),
        this.interviewScreens.bulkDelete(screenIds),
        this.interviews.delete(interviewId),
      ]);
    }
  };

  /**
   * Add a new screen to the interview.
   * The interview must already exist otherwise this will throw an error.
   *
   * @param {string} interviewId
   * @param {InterviewScreen.T} interviewScreen
   */
  addScreenToInterview = async (
    interviewId: string,
    interviewScreen: InterviewScreen.T,
  ): Promise<[Interview.T, InterviewScreen.T]> => {
    const interview = await this.getInterview(interviewId);
    invariant(
      interview,
      `[InterviewStore] addScreenToInterview: Could not find interview with id '${interviewId}'`,
    );
    const newInterview = Interview.addScreen(interview, interviewScreen);

    return Promise.all([
      this.putInterview(newInterview),
      this.putScreen(interviewScreen),
    ]);
  };

  /**
   * Add a new entry to an interview screen.
   * The screen must already exist otherwise this will throw an error.
   *
   * @param {string} screenId
   * @param {InterviewScreenEntry.T} interviewScreenEntry
   */
  addEntryToScreen = async (
    screenId: string,
    interviewScreenEntry: InterviewScreenEntry.T,
  ): Promise<[InterviewScreen.T, InterviewScreenEntry.T]> => {
    const screen = await this.getScreen(screenId);
    invariant(
      screen,
      `[InterviewStore] addEntryToScreen: Could not find screen with id '${screenId}'`,
    );

    const newScreen = InterviewScreen.addEntry(screen, interviewScreenEntry);

    return Promise.all([
      this.putScreen(newScreen),
      this.putScreenEntry(interviewScreenEntry),
    ]);
  };

  /**
   * Removes an entry from the given screen and deletes it from the interviewScreenEntries table.
   * The screen must already exist otherwise this will throw an error.
   *
   * @param {InterviewScreenEntry.T} interviewScreenEntry to remove and delete
   */
  removeEntryFromScreen = async (
    interviewScreenEntry: InterviewScreenEntry.T,
  ): Promise<InterviewScreen.T> => {
    console.log(
      `beginning removeEntryFromScreen screenId = ${interviewScreenEntry.screenId}`,
    );
    const screen = await this.getScreen(interviewScreenEntry.screenId);
    invariant(
      screen,
      `[InterviewStore] addEntryToScreen: Could not find screen with id '${interviewScreenEntry.screenId}'`,
    );

    const newScreen = InterviewScreen.removeEntry(screen, interviewScreenEntry);
    this.deleteScreenEntry(interviewScreenEntry).then(entryId => {
      // eslint-disable-next-line no-console
      console.log(`deleted screen entry: ${entryId}`);
    });

    // eslint-disable-next-line no-console
    console.log('removed entry from screen');

    return this.putScreen(newScreen);
  };
}

const InterviewStoreContext = createContext<InterviewStoreAPI | undefined>(
  undefined,
);

const InterviewStore = {
  API: InterviewStoreAPI,
  Context: InterviewStoreContext,
  Provider: InterviewStoreContext.Provider,
};

export default InterviewStore;
