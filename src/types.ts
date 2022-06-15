export enum GuessingGameQuestion {
  NAME,
  GUESS,
  INCORRECT_GUESS,
  CORRECT_ENDING,
}

export interface Question {
  id: string;
  prompt: string;
  // TODO: type can be enum e.g. Yes/No, Multi-select, etc.
  type: string;
}

export interface InterviewScreen {
  displayName: string;
  id: string;
  questions: Question[];
}

export interface Interview {
  createdDate: Date;
  description: string;
  id: string;
  name: string;
  screens: readonly InterviewScreen[];
}
