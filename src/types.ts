export enum GuessingGameQuestion {
  NAME,
  GUESS,
  INCORRECT_GUESS,
  CORRECT_ENDING,
}

export type InterviewScreen = {
  displayName: string;
  id: string;
};

export type Interview = {
  createdDate: Date;
  description: string;
  id: string;
  name: string;
  screens: readonly InterviewScreen[];
  startingState: readonly string[];
};
