import { Dispatch, createContext, useReducer } from 'react';
import appReducer, {
  AppAction,
  AppGlobalState,
  DEFAULT_APP_STATE,
} from './appReducer';

export const AppDispatch = createContext<Dispatch<AppAction>>(() => undefined);
export const AppState = createContext<AppGlobalState>(DEFAULT_APP_STATE);

export function useAppReducer(): [AppGlobalState, Dispatch<AppAction>] {
  return useReducer(appReducer, DEFAULT_APP_STATE);
}
