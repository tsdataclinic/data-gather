export enum GuessingGameQuestion {
  NAME,
  GUESS,
  INCORRECT_GUESS,
  CORRECT_ENDING,
}

export interface InterviewScreen {
  displayName: string;
  id: string;
}

export interface Interview {
  createdDate: Date;
  description: string;
  id: string;
  name: string;
  screens: readonly InterviewScreen[];
}
