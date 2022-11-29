import { useEffect, useMemo } from 'react';
import * as ConditionalAction from '../models/ConditionalAction';
import useAppDispatch from './useAppDispatch';
import useInterviewScreens from './useInterviewScreens';

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
  interviewId: string | undefined,
): Map<string, ConditionalAction.T[]> | undefined {
  const dispatch = useAppDispatch();

  // load conditional actions from backend
  const fullScreens = useInterviewScreens(interviewId);
  const conditionalActionsFromStorage = useMemo(
    () => fullScreens?.flatMap(screen => screen.actions),
    [fullScreens],
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

  const screensToActionsMap = useMemo(() => {
    if (conditionalActionsFromStorage) {
      const screenIdToActionMap = new Map<string, ConditionalAction.T[]>();
      conditionalActionsFromStorage.forEach(action => {
        if (action) {
          const actions = screenIdToActionMap.get(action.screenId) ?? [];
          screenIdToActionMap.set(action.screenId, actions.concat(action));
        }
      });
      return screenIdToActionMap;
    }
    return undefined;
  }, [conditionalActionsFromStorage]);

  return interviewId === undefined ? undefined : screensToActionsMap;
}
