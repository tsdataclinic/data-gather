import * as ConditionalAction from '../models/ConditionalAction';
import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import assertUnreachable from '../util/assertUnreachable';

export type AppGlobalState = {
  /**
   * A map of all interview conditional actions we have loaded so far.
   * Maps action id to ConditionalAction object.
   */
  loadedConditionalActions: ReadonlyMap<string, ConditionalAction.T>;

  /**
   * A map of all interview screen entries we have loaded so far.
   * Maps entry id to InterviewScreenEntry object.
   */
  loadedInterviewScreenEntries: ReadonlyMap<string, InterviewScreenEntry.T>;

  /**
   * A map of all interview screens we have loaded so far.
   * Maps screen id to InterviewScreen object.
   */
  loadedInterviewScreens: ReadonlyMap<string, InterviewScreen.T>;

  /**
   * A map of all interviews that have been loaded so far
   * Maps interview id to Interview object.
   */
  loadedInterviews: ReadonlyMap<string, Interview.T>;
};

export const DEFAULT_APP_STATE: AppGlobalState = {
  loadedConditionalActions: new Map(),
  loadedInterviewScreenEntries: new Map(),
  loadedInterviewScreens: new Map(),
  loadedInterviews: new Map(),
};

export type AppAction =
  /** Update a bunch of interview conditional actions */
  | {
      conditionalActions: ConditionalAction.T[];
      type: 'CONDITIONAL_ACTIONS_UPDATE';
    }
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
    }
  /** Update a bunch of interview screen entries */
  | {
      screenEntries: InterviewScreenEntry.T[];
      type: 'SCREEN_ENTRIES_UPDATE';
    }
  /** Update a single interview screen */
  | {
      screen: InterviewScreen.T;
      type: 'SCREEN_UPDATE';
    }
  /** Update a bunch of interview screens */
  | {
      screens: InterviewScreen.T[];
      type: 'SCREENS_UPDATE';
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

/**
 * Helper function to immutably set multiple values to a map.
 */
function setMapMultiple<T>(
  map: ReadonlyMap<string, T>,
  vals: readonly T[],
  keyExtractor: (val: T) => string,
): Map<string, T> {
  const clonedMap = cloneMap(map);
  vals.forEach(val => clonedMap.set(keyExtractor(val), val));
  return clonedMap;
}

export default function appReducer(
  state: AppGlobalState,
  action: AppAction,
): AppGlobalState {
  const {
    loadedConditionalActions,
    loadedInterviews,
    loadedInterviewScreenEntries,
    loadedInterviewScreens,
  } = state;

  switch (action.type) {
    case 'CONDITIONAL_ACTIONS_UPDATE':
      return {
        ...state,
        loadedConditionalActions: setMapMultiple(
          loadedConditionalActions,
          action.conditionalActions,
          conditionalAction => conditionalAction.id,
        ),
      };
    case 'INTERVIEWS_UPDATE': {
      return {
        ...state,
        loadedInterviews: setMapMultiple(
          loadedInterviews,
          action.interviews,
          interview => interview.id,
        ),
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
      const { interviewId, screen } = action;

      // find the interview to update
      const interview = loadedInterviews.get(interviewId);

      if (interview) {
        // add the new screen id to the interview
        const newInterview = {
          ...interview,
          screens: interview.screens.concat(screen.id),
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

    case 'SCREEN_ENTRIES_UPDATE':
      return {
        ...state,
        loadedInterviewScreenEntries: setMapMultiple(
          loadedInterviewScreenEntries,
          action.screenEntries,
          screenEntry => screenEntry.id,
        ),
      };

    case 'SCREEN_UPDATE':
      return {
        ...state,
        loadedInterviewScreens: setMap(
          loadedInterviewScreens,
          action.screen.id,
          action.screen,
        ),
      };

    case 'SCREENS_UPDATE':
      return {
        ...state,
        loadedInterviewScreens: setMapMultiple(
          loadedInterviewScreens,
          action.screens,
          screen => screen.id,
        ),
      };

    default:
      return assertUnreachable(action);
  }
}
