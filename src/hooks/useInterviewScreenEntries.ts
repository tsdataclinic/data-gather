import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import isNonNullable from '../util/isNonNullable';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
import useInterviewScreens from './useInterviewScreens';
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
  const screens = useInterviewScreens(interviewId);

  // load screen entries from backend
  const screenEntriesFromStorage = useLiveQuery(
    () =>
      interviewId === undefined
        ? undefined
        : interviewStore.getScreenEntriesOfInterview(interviewId),
    [interviewId],
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

  // load the screen entries from global state (which should be up-to-date with
  // whatever is in storage)
  const screensToEntriesMap = useMemo(() => {
    if (screens) {
      const screenIdToEntriesMap = new Map<string, InterviewScreenEntry.T[]>();
      screens.forEach(screen => {
        const entries = screen.entries
          .map(entryId => loadedInterviewScreenEntries.get(entryId))
          .filter(isNonNullable);
        screenIdToEntriesMap.set(screen.id, entries);
      });
      return screenIdToEntriesMap;
    }
    return undefined;
  }, [screens, loadedInterviewScreenEntries]);

  return interviewId === undefined ? undefined : screensToEntriesMap;
}
