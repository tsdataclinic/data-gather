import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
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

  private interviews!: Table<Interview.SerializedT>;

  private interviewScreens!: Table<InterviewScreen.SerializedT>;

  private interviewScreenEntries!: Table<InterviewScreenEntry.SerializedT>;

  constructor() {
    super('DataClinicInterviewApp');

    // id is our primary key
    this.version(1).stores({
      conditionalActions: '++id, screenId',
      interviewScreenEntries: '++id, screenId',
      interviewScreens: '++id, interviewId',
      interviews: '++id',
    });
  }

  InterviewAPI = {
    createInterview: async (
      interview: Interview.CreateT,
    ): Promise<Interview.T> => {
      // generate id and createdDate
      const serializedInterview: Interview.SerializedT = {
        ...interview,
        id: uuidv4(),
        createdDate: new Date().toISOString(),
      };

      await this.interviews.add(serializedInterview);
      return Interview.deserialize(serializedInterview);
    },

    getAllInterviews: async (): Promise<Interview.T[]> => {
      const serializedInterviews = await this.interviews.toArray();
      return serializedInterviews.map(Interview.deserialize);
    },

    getInterview: async (
      interviewId: string,
    ): Promise<Interview.WithScreensT> => {
      const interview = await this.interviews.get(interviewId);
      if (interview) {
        // get screens for this interview
        const screens = await this.interviewScreens
          .where({ interviewId })
          .toArray();
        screens.sort((scr1, scr2) => scr1.order - scr2.order);
        return Interview.deserialize({ ...interview, screens });
      }
      throw new Error(`Could not find an interview with id '${interviewId}'`);
    },

    updateInterview: async (
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T> => {
      const interviewExists = !!(await this.interviews.get(interviewId));
      if (interviewExists) {
        await this.interviews.put(Interview.serialize(interview));
        return interview;
      }
      throw new Error(
        `Cannot update interview. Interview with id '${interviewId}' does not exist`,
      );
    },

    updateInterviewStartingState: async (
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensT> => {
      const serializedInterview = await this.interviews.get(interviewId);
      if (serializedInterview) {
        // get screens for this interview
        const screens = await this.interviewScreens
          .where({ interviewId })
          .toArray();

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
  };

  InterviewScreenAPI = {
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
