import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import assertUnreachable from '../util/assertUnreachable';

export type AppGlobalState = {
  /** An array of all interview screens we have loaded so far */
  allInterviewScreens: ReadonlyMap<string, InterviewScreen.T>;

  /** An array of all interviews that belong to this user */
  allInterviews: readonly Interview.T[];
};

export const DEFAULT_APP_STATE: AppGlobalState = {
  allInterviewScreens: new Map(),
  allInterviews: [],
};

export type AppAction =
  /** Set all the interviews to show in the app */
  | {
      allInterviews: readonly Interview.T[];
      type: 'INTERVIEWS_SET_ALL';
    }
  /** Create a new interview */
  | {
      interview: Interview.T;
      type: 'INTERVIEW_CREATE';
    }
  /** Add a screen to an interview */
  | {
      interviewId: string;
      screen: InterviewScreen.T;
      type: 'SCREEN_ADD';
    };

export default function appReducer(
  state: AppGlobalState,
  action: AppAction,
): AppGlobalState {
  const { allInterviews, allInterviewScreens } = state;

  switch (action.type) {
    case 'INTERVIEWS_SET_ALL':
      return { ...state, allInterviews: action.allInterviews };

    case 'INTERVIEW_CREATE':
      return {
        ...state,
        allInterviews: allInterviews.concat(action.interview),
      };

    case 'SCREEN_ADD': {
      const { screen } = action;

      // find the interview to update
      const interview = allInterviews.find(
        intrv => intrv.id === action.interviewId,
      );

      if (interview) {
        // add the new screen id to the interview
        const newInterview = {
          ...interview,
          screens: interview.screens.concat(action.screen.id),
        };

        return {
          ...state,

          // add the screen to the allInterviewScreens map (immutable operation)
          // TODO: extract these common immutable operations to helper functions
          allInterviewScreens: new Map<string, InterviewScreen.T>(
            Array.from(allInterviewScreens.entries()),
          ).set(screen.id, screen),

          // update the allInterviews array immutably (O(n) operation using .map)
          allInterviews: allInterviews.map(intrv =>
            intrv.id === action.interviewId ? newInterview : intrv,
          ),
        };
      }

      return state;
    }
    default:
      return assertUnreachable(action);
  }
}
