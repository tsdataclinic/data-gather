import Dexie, { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { Screen, Interview } from './models';

type InterviewRow = {
  description: string;
  id: string;
  interview: Interview;
  name: string;
};

class InterviewStore extends Dexie {
  interviews!: Table<InterviewRow>;

  constructor() {
    super('interviews');
    this.version(1).stores({ interviews: 'id' }); // id is our primary key
  }

  /**
   * Return a live view of the current interview
   * @param id
   * @returns
   */
  useCurrentInterview = (id: string): InterviewRow | undefined =>
    useLiveQuery(() => this.interviews.get(id), [id]);

  /**
   * Returns all interview IDs
   */
  getInterviewIds = async (): Promise<string[]> => {
    const interviews = await this.interviews.toArray();
    return interviews.map(row => row.id);
  };

  /**
   * Create a new empty interview
   * @param id
   * @param name
   * @param description
   */
  createInterview = async (
    id: string,
    name: string,
    description: string,
  ): Promise<void> => {
    const interview: Interview = {
      screens: {},
      startingState: [],
    };

    await this.interviews.add({ description, id, interview, name });
  };

  /**
   * Update an interview by id
   * @param id
   * @param interview
   */
  updateInterview = async (id: string, interview: Interview): Promise<void> => {
    this.interviews.update(id, { interview });
  };

  /**
   * Delete an interview with an ID
   * @param id
   */
  deleteInterview = async (id: string): Promise<void> => {
    await this.interviews.where('id').equals(id).delete();
  };

  /**
   * Add a new screen to the interview
   * @param id
   * @param screenId
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
   * @param id
   * @param screenId
   * @param screen
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

export const api = new InterviewStore();
