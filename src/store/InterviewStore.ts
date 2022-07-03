import Dexie, { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { Page, Interview } from './models';

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

  useCurrentInterview = (id: string): InterviewRow | undefined =>
    useLiveQuery(() => this.interviews.get(id), [id]);

  getInterviewIds = async (): Promise<string[]> => {
    const interviews = await this.interviews.toArray();
    return interviews.map(row => row.id);
  };

  createInterview = async (
    id: string,
    name: string,
    description: string,
  ): Promise<void> => {
    const interview: Interview = {
      pages: {},
      startingState: [],
    };

    await this.interviews.add({ description, id, interview, name });
  };

  updateInterview = async (id: string, interview: Interview): Promise<void> => {
    this.interviews.update(id, { interview });
  };

  deleteInterview = async (id: string): Promise<void> => {
    await this.interviews.where('id').equals(id).delete();
  };

  addPageToInterview = async (id: string, pageId: string): Promise<void> => {
    const interviewRow = await this.interviews.get(id);

    if (!interviewRow) {
      throw new Error(
        `Tried to add a page to nonexistent interview with ID ${id}`,
      );
    }

    const { interview } = interviewRow;

    const newPage: Page = {
      actions: [],
      entries: [],
      headerText: '',
      title: '',
    };

    interview.pages[pageId] = newPage;

    await this.updateInterview(id, interview);
  };

  updatePage = async (
    id: string,
    pageId: string,
    page: Page,
  ): Promise<void> => {
    const interviewRow = await this.interviews.get(id);

    if (!interviewRow) {
      throw new Error(
        `Tried to update a page in nonexistent interview with ID ${id}`,
      );
    }

    const { interview } = interviewRow;

    interview.pages[pageId] = page;

    await this.updateInterview(id, interview);
  };
}

export const api = new InterviewStore();
