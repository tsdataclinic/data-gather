import Dexie, { Table } from 'dexie';
import { createContext } from 'react';
import { Interview as RealInterview } from '../types';
import { Screen, Interview } from './models';

export type InterviewRow = {
  createdDate: Date;
  description: string;
  id: string;
  interview: Interview;
  name: string;
};

export class InterviewStoreAPI extends Dexie {
  interviews!: Table<InterviewRow>;

  constructor() {
    super('interviews');
    this.version(1).stores({ interviews: 'id' }); // id is our primary key
  }

  /**
   * Returns all interview IDs
   */
  getInterviewIds = async (): Promise<string[]> => {
    const interviews = await this.interviews.toArray();
    return interviews.map(row => row.id);
  };

  /**
   * Returns all interview rows.
   * @returns {Interview[]} Array of interviews
   */
  getAllInterviews = async (): Promise<RealInterview[]> => {
    const interviews = await this.interviews.toArray();

    // TODO: replace this with a proper deserialization function
    return interviews.map(interviewRow => ({
      createdDate: interviewRow.createdDate,
      description: interviewRow.description,
      id: interviewRow.id,
      name: interviewRow.name,
      screens: [],
      startingState: [],
    }));
  };

  /**
   * Create a new empty interview
   * @param {string} id
   * @param {string} name
   * @param {string} description
   */
  createInterview = async (
    id: string,
    name: string,
    description: string,
  ): Promise<RealInterview> => {
    const interviewRow = {
      createdDate: new Date(),
      description,
      id,
      interview: {
        screens: {},
        startingState: [],
      },
      name,
    };

    await this.interviews.add(interviewRow);

    return {
      createdDate: interviewRow.createdDate,
      description: interviewRow.description,
      id: interviewRow.id,
      name: interviewRow.name,
      screens: [],
      startingState: [],
    };
  };

  /**
   * Update an interview by id
   * @param {string} id
   * @param {Interview} interview
   */
  updateInterview = async (id: string, interview: Interview): Promise<void> => {
    await this.interviews.update(id, { interview });
  };

  /**
   * Delete an interview with an ID
   * @param {string} id
   */
  deleteInterview = async (id: string): Promise<void> => {
    await this.interviews.where('id').equals(id).delete();
  };

  /**
   * Add a new screen to the interview
   * @param {string} id
   * @param {string} screenId
   */
  addScreenToInterview = async (
    id: string,
    screenId: string,
  ): Promise<void> => {
    const interviewRow = await this.interviews.get(id);
    if (!interviewRow) {
      throw new Error(
        `Tried to add a screen to nonexistent interview with ID ${id}`,
      );
    }

    const { interview } = interviewRow;
    const newScreen: Screen = {
      actions: [],
      entries: [],
      headerText: '',
      title: '',
    };

    interview.screens[screenId] = newScreen;
    await this.updateInterview(id, interview);
  };

  /**
   * Update a particular screen
   * @param {string} id
   * @param {string} screenId
   * @param {Screen} screen
   */
  updateScreen = async (
    id: string,
    screenId: string,
    screen: Screen,
  ): Promise<void> => {
    const interviewRow = await this.interviews.get(id);
    if (!interviewRow) {
      throw new Error(
        `Tried to update a screen in nonexistent interview with ID ${id}`,
      );
    }

    const { interview } = interviewRow;
    interview.screens[screenId] = screen;
    await this.updateInterview(id, interview);
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
