import { useEffect, useMemo } from 'react';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import useAppDispatch from './useAppDispatch';
import useInterviewScreens from './useInterviewScreens';

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

  // load screen entries from backend
  // load conditional actions from backend
  const fullScreens = useInterviewScreens(interviewId);
  const screenEntriesFromStorage = useMemo(
    () => fullScreens?.flatMap(screen => screen.entries),
    [fullScreens],
  );

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

  const screensToEntriesMap = useMemo(() => {
    if (screenEntriesFromStorage) {
      const screenIdToEntriesMap = new Map<string, InterviewScreenEntry.T[]>();
      screenEntriesFromStorage.forEach(entry => {
        const entries = screenIdToEntriesMap.get(entry.screenId) ?? [];
        screenIdToEntriesMap.set(entry.screenId, entries.concat(entry));
      });
      return screenIdToEntriesMap;
    }
    return undefined;
  }, [screenEntriesFromStorage]);

  return interviewId === undefined ? undefined : screensToEntriesMap;
}
