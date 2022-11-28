import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import * as ConditionalAction from '../models/ConditionalAction';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
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
  interviewId: string | undefined,
): Map<string, ConditionalAction.T[]> | undefined {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { loadedConditionalActions } = useAppState();

  // load conditional actions from backend
  const { data: conditionalActionsFromStorage } = useQuery({
    queryKey: ['conditionalActions', interviewId],
    queryFn: async () => {
      if (interviewId === undefined) {
        return undefined;
      }

      const interview = await interviewStore.InterviewAPI.getInterview(
        interviewId,
      );

      const screens = await Promise.all(
        interview.screens.map(screen =>
          interviewStore.InterviewScreenAPI.getInterviewScreen(screen.id),
        ),
      );
      return screens.flatMap(screen => screen.actions);
    },
  });

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
    if (conditionalActionsFromStorage) {
      const screenIdToActionMap = new Map<string, ConditionalAction.T[]>();
      conditionalActionsFromStorage.forEach(action => {
        const loadedAction = loadedConditionalActions.get(action.id);
        if (loadedAction) {
          const actions = screenIdToActionMap.get(action.screenId) ?? [];
          screenIdToActionMap.set(
            loadedAction.screenId,
            actions.concat(loadedAction),
          );
        }
      });
      return screenIdToActionMap;
    }
    return undefined;
  }, [loadedConditionalActions, conditionalActionsFromStorage]);

  return interviewId === undefined ? undefined : screensToActionsMap;
}
