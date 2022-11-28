import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch all interview screen entries linked to a given interview.
 * An interview can have multiple screens, and each screen can have multiple
 * entries.
 *
 * @param {string} interviewId The interview id to look up
 *
 * @returns {Map<string, InterviewScreenEntry.T[]> | undefined} A Map of all
 * screen entries mapping screen id to its corresponding array of screen
 * entries. Or undefined if the interview could not be found.
 */
export default function useInterviewScreenEntries(
  interviewId: string | undefined,
): Map<string, InterviewScreenEntry.T[]> | undefined {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { loadedInterviewScreenEntries } = useAppState();

  // load screen entries from backend
  const { data: screenEntriesFromStorage } = useQuery({
    queryKey: ['interviewScreenEntries', interviewId],
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
      return screens.flatMap(screen => screen.entries);
    },
  });

  // if the screenEntriesFromStorage has changed then we should update it in
  // our global state
  useEffect(() => {
    if (screenEntriesFromStorage) {
      dispatch({
        screenEntries: screenEntriesFromStorage,
        type: 'SCREEN_ENTRIES_UPDATE',
      });
    }
  }, [screenEntriesFromStorage, dispatch]);

  // load the screen entries from global state (which should be up-to-date with
  // whatever is in storage)
  const screensToEntriesMap = useMemo(() => {
    if (screenEntriesFromStorage) {
      const screenIdToEntriesMap = new Map<string, InterviewScreenEntry.T[]>();
      screenEntriesFromStorage.forEach(entry => {
        const loadedEntry = loadedInterviewScreenEntries.get(entry.id);
        if (loadedEntry) {
          const entries = screenIdToEntriesMap.get(loadedEntry.screenId) ?? [];
          screenIdToEntriesMap.set(
            loadedEntry.screenId,
            entries.concat(loadedEntry),
          );
        }
      });
      return screenIdToEntriesMap;
    }
    return undefined;
  }, [loadedInterviewScreenEntries, screenEntriesFromStorage]);

  return interviewId === undefined ? undefined : screensToEntriesMap;
}
