import { ResponseData } from '@dataclinic/interview';

/**
 * A single comparison between some datum within the response data and a given value.
 */
export type Condition = {
  // The key within the response data which maps to the datum being compared.
  key: string;

  // Which operation to use for the comparison
  operator: '=' | '>' | '<' | '>=' | '<=';

  // The value to compare the response datum to.
  value: any;
};

/**
 * An action which may be executed after some response data is collected, if a given condition
 * is true (or, if the condition field is left out, always). Different values of the action field
 * imply different datatypes for the value of the target field (e.g. a 'push' action takes a list
 * of quesiton IDs to push, a 'skip' action takes some response data).
 */
export type ConditionalAction = {
  condition?: Condition;
} & ( // Push some entries on to the stack
  | {
      action: 'push';
      target: string[];
    }

  // Skip the following question and add response data in place of the user
  | {
      action: 'skip';
      target: ResponseData;
    }

  // Add a checkpoint, restore a checkpoint, or declare a milestone to be passed
  | {
      action: 'checkpoint' | 'restore' | 'milestone';
      target: string;
    }
);

/**
 * Represents a single question asked to the interview subject
 */
export type Entry = {
  //  The text of the question
  prompt: string;

  // The id associated with the resposnse to the question
  responseId: string;

  // The data type expected as a response
  responseType: string;

  // Additional flavor text associated with the question
  text: string;
};

/**
 * A group of entries, corresponding to a particular state in the interview
 */
export type Page = {
  // the actions executed after the page is complete
  actions: ConditionalAction[];

  // The entries on this page
  entries: Entry[];

  // description text for the page
  headerText: string;

  // title of the page
  title: string;
};

/**
 * Represents all the data associated with interview flow
 */
export type Interview = {
  pages: { [pageName: string]: Page };
  startingState: string[];
};
