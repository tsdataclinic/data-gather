import Dexie, { Table } from 'dexie';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import * as User from '../../models/User';
import * as SubmissionAction from '../../models/SubmissionAction';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import { InterviewServiceAPI } from './InterviewServiceAPI';

/**
 * This service is used for local browser storage.
 *
 * All functions here should return deserialized models. Meaning, they
 * should be translated from their backend representation to a usable
 * frontend representation. For example, any dates as numerical timestamps
 * should be converted to Date objects before returning.
 */
export default class LocalInterviewService
  extends Dexie
  implements InterviewServiceAPI
{
  private conditionalActions!: Table<ConditionalAction.SerializedT>;

  private submissionActions!: Table<SubmissionAction.SerializedT>;

  private interviews!: Table<Interview.SerializedT>;

  private interviewScreens!: Table<InterviewScreen.SerializedT>;

  private interviewScreenEntries!: Table<InterviewScreenEntry.SerializedT>;

  constructor() {
    super('DataClinicInterviewApp');

    // id is our primary key
    this.version(1).stores({
      conditionalActions: '++id, screenId',
      submissionActions: '++id, interviewId',
      interviewScreenEntries: '++id, screenId',
      interviewScreens: '++id, interviewId',
      interviews: '++id, vanityUrl',
    });
  }

  userAPI = {
    /**
     * If fetching the current user from the browser, just return a User object
     * with some default values.
     *
     * TODO: implement the notion of a 'User' in the browser storage by
     * creating some session id.
     */
    getCurrentUser: async (): Promise<User.T> => ({
      createdDate: DateTime.now(),
      email: 'unauthenticated',
      familyName: '',
      givenName: '',
      id: 'unauthenticated',
      identityProvider: 'unauthenticated',
    }),
  };

  interviewAPI = {
    createInterview: async (
      interview: Interview.CreateT,
    ): Promise<Interview.T> => {
      // generate id and createdDate
      const serializedInterview: Interview.SerializedT = {
        ...Interview.serialize(interview),
        id: uuidv4(),
        createdDate: new Date().toISOString(),
      };

      await this.interviews.add(serializedInterview);

      const newScreen = InterviewScreen.create({
        interviewId: serializedInterview.id,
        isInStartingState: true,
        startingStateOrder: 1,
        title: 'Stage 1',
        defaultLanguage: serializedInterview.defaultLanguage,
      });

      // start the interview with 1 screen by default
      await this.interviewScreenAPI.createInterviewScreen(newScreen);

      return Interview.deserialize(serializedInterview);
    },

    deleteInterview: async (interviewId: string): Promise<void> => {
      const interview = await this.interviewAPI.getInterview(interviewId);

      // delete all screens
      const deleteScreensPromise = Promise.all(
        interview.screens.map(screen =>
          this.interviewScreenAPI.deleteInterviewScreen(screen.id),
        ),
      );

      // delete the submission actions
      const deleteSubmissionActionsPromise = this.submissionActions.bulkDelete(
        interview.submissionActions.map(action => action.id),
      );

      await Promise.all([
        deleteScreensPromise,
        deleteSubmissionActionsPromise,

        // now delete the interview itself
        this.interviews.delete(interviewId),
      ]);
    },

    getAllEntries: async (
      interviewId: string,
    ): Promise<InterviewScreenEntry.WithScreenT[]> => {
      const { screens } = await this.interviewAPI.getInterview(interviewId);

      const promises = screens.map(async screen => {
        const serializedEntries = await this.interviewScreenEntries
          .where({ screenId: screen.id })
          .toArray();
        const entries = serializedEntries.map(InterviewScreenEntry.deserialize);
        return entries.map(entry => ({
          ...entry,
          screen,
        }));
      });

      const entries = await Promise.all(promises);
      return entries.flat();
    },

    getAllInterviews: async (): Promise<Interview.T[]> => {
      const serializedInterviews = await this.interviews.toArray();
      return serializedInterviews.map(Interview.deserialize);
    },

    getInterview: async (
      interviewId: string,
    ): Promise<Interview.WithScreensAndActions> => {
      const interview = await this.interviews.get(interviewId);
      if (interview) {
        // get screens
        const screens = await this.interviewAPI.getScreensOfInterview(
          interviewId,
        );

        // get submission actions
        const submissionActions =
          await this.interviewAPI.getSubmissionActionsOfInterview(interviewId);

        return Interview.deserialize({
          ...interview,
          screens,
          submissionActions,
        });
      }
      throw new Error(`Could not find an interview with id '${interviewId}'`);
    },

    getInterviewByVanityUrl: () => {
      throw new Error(
        'Loading interview by vanity URL should only occur on the backend and not via browser storage.',
      );
    },

    updateInterview: async (
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T> => {
      const interviewExists = !!(await this.interviews.get(interviewId));
      if (interviewExists) {
        const { submissionActions, ...serializedInterview } =
          Interview.serialize(interview);
        await this.interviews.put(serializedInterview);

        // delete existing submission actions
        const oldActions = await this.submissionActions
          .where({ interviewId })
          .toArray();
        await this.submissionActions.bulkDelete(
          oldActions.map(action => action.id),
        );

        // make sure all actions have an id if they don't
        const actionsToSet: SubmissionAction.SerializedT[] =
          submissionActions.map(action => ({
            ...action,
            id: action.id ?? uuidv4(),
          }));

        // set them all into the db
        await this.submissionActions.bulkPut(actionsToSet);

        // now return the deserialized model
        const fullModel = {
          ...serializedInterview,
          actions: actionsToSet,
        };

        return Interview.deserialize(fullModel);
      }
      throw new Error(
        `Cannot update interview. Interview with id '${interviewId}' does not exist`,
      );
    },

    updateInterviewStartingState: async (
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensAndActions> => {
      const serializedInterview = await this.interviews.get(interviewId);
      if (serializedInterview) {
        const screens = await this.interviewAPI.getScreensOfInterview(
          interviewId,
        );

        // map each starting screen id to its index
        const startingScreenToIdx: Record<string, number> = {};
        startingScreenIds.forEach((screenId, idx) => {
          startingScreenToIdx[screenId] = idx;
        });

        const newScreens = screens.map(screen => ({
          ...screen,
          isInStartingState: screen.id in startingScreenToIdx,
          startingStateOrder:
            screen.id in startingScreenToIdx
              ? startingScreenToIdx[screen.id]
              : undefined,
        }));

        // now write the screens back
        await this.interviewScreens.bulkPut(newScreens);

        return Interview.deserialize({
          ...serializedInterview,
          screens: newScreens,
        });
      }
      throw new Error(`Could not find an interview with id '${interviewId}'`);
    },

    getScreensOfInterview: async (
      interviewId: string,
    ): Promise<InterviewScreen.SerializedT[]> => {
      // get screens for this interview
      const screens = await this.interviewScreens
        .where({ interviewId })
        .toArray();
      screens.sort((scr1, scr2) => scr1.order - scr2.order);
      return screens;
    },

    getSubmissionActionsOfInterview: async (
      interviewId: string,
    ): Promise<SubmissionAction.SerializedT[]> => {
      // get submission actions for this interview
      const actions = await this.submissionActions
        .where({ interviewId })
        .toArray();
      actions.sort((act1, act2) => act1.order - act2.order);
      return actions;
    },

    updateScreensOrder: async (): Promise<Interview.WithScreensAndActions> => {
      // TODO: implement this
      throw new Error('not implemented yet');
    },
  };

  interviewScreenAPI = {
    createInterviewScreen: async (
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T> => {
      const otherScreens = await this.interviewScreens
        .where({ interviewId: screen.interviewId })
        .toArray();
      const sortedScreens = otherScreens.sort(
        (scr1, scr2) => scr1.order - scr2.order,
      );
      const lastScreen = sortedScreens[sortedScreens.length - 1];
      const serializedScreen: InterviewScreen.SerializedT = {
        ...screen,
        id: uuidv4(),
        order: lastScreen === undefined ? 1 : lastScreen.order + 1,
      };

      await this.interviewScreens.add(serializedScreen);
      return InterviewScreen.deserialize(serializedScreen);
    },

    deleteInterviewScreen: async (screenId: string): Promise<void> => {
      const screen = await this.interviewScreenAPI.getInterviewScreen(screenId);
      const { entries, actions } = screen;

      // delete the related actions and entries
      await Promise.all([
        this.conditionalActions.bulkDelete(actions.map(action => action.id)),
        this.interviewScreenEntries.bulkDelete(entries.map(entry => entry.id)),

        // now delete the screen
        this.interviewScreens.delete(screen.id),
      ]);
    },

    getInterviewScreen: async (
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT> => {
      const screen = await this.interviewScreens.get(screenId);
      if (screen) {
        // get relationships
        const actions = await this.conditionalActions
          .where({ screenId })
          .toArray();
        const entries = await this.interviewScreenEntries
          .where({ screenId })
          .toArray();
        const serializedScreen = {
          ...screen,
          actions,
          entries,
        };
        return InterviewScreen.deserialize(serializedScreen);
      }
      throw new Error(
        `Could not find an interview screen with id '${screenId}'`,
      );
    },

    updateInterviewScreen: async (
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT> => {
      const screenExists = !!(await this.interviewScreens.get(screenId));
      if (screenExists) {
        const { actions, entries, ...serializedScreen } =
          InterviewScreen.serialize(screen);
        await this.interviewScreens.put(serializedScreen);

        // delete existing entries and actions
        const oldActions = await this.conditionalActions
          .where({ screenId })
          .toArray();
        const oldEntries = await this.interviewScreenEntries
          .where({ screenId })
          .toArray();

        await this.conditionalActions.bulkDelete(
          oldActions.map(action => action.id),
        );
        await this.interviewScreenEntries.bulkDelete(
          oldEntries.map(entry => entry.id),
        );

        // make sure all actions and entries have an id if they don't
        const actionsToSet: ConditionalAction.SerializedT[] = actions.map(
          action => ({
            ...action,
            id: action.id ?? uuidv4(),
          }),
        );
        const entriesToSet: InterviewScreenEntry.SerializedT[] = entries.map(
          entry => ({
            ...entry,
            id: entry.id ?? uuidv4(),
          }),
        );

        // set them all into the db
        await this.conditionalActions.bulkPut(actionsToSet);
        await this.interviewScreenEntries.bulkPut(entriesToSet);

        // now return the deserialized model
        const fullModel = {
          ...serializedScreen,
          actions: actionsToSet,
          entries: entriesToSet,
        };
        return InterviewScreen.deserialize(fullModel);
      }

      throw new Error(
        `Cannot update screen. Screen with id '${screenId}' does not exist`,
      );
    },
  };
}
