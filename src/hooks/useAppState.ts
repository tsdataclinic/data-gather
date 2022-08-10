import { useContext } from 'react';
import { AppGlobalState } from '../store/appReducer';
import { AppState } from '../store/appState';

/**
 * This hook loads the global app state from the AppState context.
 */
export default function useAppState(): AppGlobalState {
  return useContext(AppState);
}
