import { Interview } from '../types';
import assertUnreachable from '../util/assertUnreachable';

export type AppGlobalState = {
  allInterviews: readonly Interview[];
};

export const DEFAULT_APP_STATE: AppGlobalState = {
  allInterviews: [],
};

export type AppAction =
  | {
      allInterviews: readonly Interview[];
      type: 'INTERVIEWS_SET_ALL';
    }
  | {
      interview: Interview;
      type: 'INTERVIEW_CREATE';
    };

export default function appReducer(
  state: AppGlobalState,
  action: AppAction,
): AppGlobalState {
  const { allInterviews } = state;

  switch (action.type) {
    case 'INTERVIEWS_SET_ALL':
      return { ...state, allInterviews: action.allInterviews };

    case 'INTERVIEW_CREATE':
      return {
        ...state,
        allInterviews: allInterviews.concat(action.interview),
      };

    default:
      return assertUnreachable(action);
  }
}
