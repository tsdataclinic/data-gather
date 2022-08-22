import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import * as ConditionalAction from '../models/ConditionalAction';
import isNonNullable from '../util/isNonNullable';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
import useInterviewScreens from './useInterviewScreens';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch all interview conditional actions linked to a given interview.
 * An interview can have multiple screens, and each screen can have multiple
 * actions.
 *
 * @param {string} interviewId - The interview id to look up
 *
 * @returns {Map<string, ConditionalAction.T[]> | undefined} A Map of all
 * conditional actions mapping screen id to its corresponding array of actions.
 * Or undefined if the interview could not be found.
 */
export default function useInterviewConditionalActions(
  interviewId: string,
): Map<string, ConditionalAction.T[]> | undefined {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { loadedConditionalActions } = useAppState();
  const screens = useInterviewScreens(interviewId);

  // load conditional actions from backend
  const conditionalActionsFromStorage = useLiveQuery(
    () => interviewStore.getConditionalActionsOfInterview(interviewId),
    [interviewId],
  );

  // if the screenEntriesFromStorage has changed then we should update it in
  // our global state
  useEffect(() => {
    if (conditionalActionsFromStorage) {
      dispatch({
        conditionalActions: conditionalActionsFromStorage,
        type: 'CONDITIONAL_ACTIONS_UPDATE',
      });
    }
  }, [conditionalActionsFromStorage, dispatch]);

  // load the conditional actions from global state (which should be up-to-date with
  // whatever is in storage)
  const screensToActionsMap = useMemo(() => {
    if (screens) {
      const screenIdToActionMap = new Map<string, ConditionalAction.T[]>();
      screens.forEach(screen => {
        const actions = screen.actions
          .map(actionId => loadedConditionalActions.get(actionId))
          .filter(isNonNullable);
        screenIdToActionMap.set(screen.id, actions);
      });
      return screenIdToActionMap;
    }
    return undefined;
  }, [screens, loadedConditionalActions]);

  return screensToActionsMap;
}
