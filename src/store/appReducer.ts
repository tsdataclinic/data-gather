import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import assertUnreachable from '../util/assertUnreachable';

export type AppGlobalState = {
  /** An array of all interview screens we have loaded so far */
  loadedInterviewScreens: ReadonlyMap<string, InterviewScreen.T>;

  /** A map of all interviews that have been loaded so far */
  loadedInterviews: ReadonlyMap<string, Interview.T>;
};

export const DEFAULT_APP_STATE: AppGlobalState = {
  loadedInterviewScreens: new Map(),
  loadedInterviews: new Map(),
};

export type AppAction =
  /** Update a bunch of interviews */
  | {
      interviews: Interview.T[];
      type: 'INTERVIEWS_UPDATE';
    }
  /** Update a single interview */
  | {
      interview: Interview.T;
      type: 'INTERVIEW_UPDATE';
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

function cloneMap<K, V>(map: ReadonlyMap<K, V>): Map<K, V> {
  return new Map(Array.from(map.entries()));
}

/**
 * Helper function to immutably set a value to a map
 */
function setMap<T>(
  map: ReadonlyMap<string, T>,
  key: string,
  val: T,
): Map<string, T> {
  return cloneMap(map).set(key, val);
}

export default function appReducer(
  state: AppGlobalState,
  action: AppAction,
): AppGlobalState {
  const { loadedInterviews, loadedInterviewScreens } = state;

  switch (action.type) {
    case 'INTERVIEWS_UPDATE': {
      const clonedInterviewMap = cloneMap(loadedInterviews);
      action.interviews.forEach(interview =>
        clonedInterviewMap.set(interview.id, interview),
      );

      return {
        ...state,
        loadedInterviews: clonedInterviewMap,
      };
    }

    case 'INTERVIEW_UPDATE': {
      return {
        ...state,
        loadedInterviews: setMap(
          loadedInterviews,
          action.interview.id,
          action.interview,
        ),
      };
    }

    case 'INTERVIEW_CREATE':
      return {
        ...state,
        loadedInterviews: setMap(
          loadedInterviews,
          action.interview.id,
          action.interview,
        ),
      };

    case 'SCREEN_ADD': {
      const { screen } = action;

      // find the interview to update
      const interview = loadedInterviews.get(action.interviewId);

      if (interview) {
        // add the new screen id to the interview
        const newInterview = {
          ...interview,
          screens: interview.screens.concat(action.screen.id),
        };

        return {
          ...state,

          // add the screen to the loadedInterviewScreens map (immutable operation)
          loadedInterviewScreens: setMap(
            loadedInterviewScreens,
            screen.id,
            screen,
          ),

          loadedInterviews: setMap(
            loadedInterviews,
            action.interviewId,
            newInterview,
          ),
        };
      }

      return state;
    }
    default:
      return assertUnreachable(action);
  }
}
