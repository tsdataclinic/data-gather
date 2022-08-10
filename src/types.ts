export enum GuessingGameQuestion {
  NAME,
  GUESS,
  INCORRECT_GUESS,
  CORRECT_ENDING,
}

export interface Entry {
  id: string;
  prompt: string;
  type: string; // TODO: type can be enum e.g. Yes/No, Multi-select, etc.
}

export interface Header {
  text: string;
  title: string;
}

export interface InterviewScreen {
  displayName: string;
  entries: Entry[];
  header: Header;
  id: string;
}

export interface Interview {
  createdDate: Date;
  description: string;
  id: string;
  name: string;
  screens: readonly InterviewScreen[];
  startingState: readonly string[];
}
