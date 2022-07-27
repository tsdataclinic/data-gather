import { Dispatch, useContext } from 'react';
import { AppAction } from '../store/appReducer';
import { AppDispatch } from '../store/appState';

/**
 * This hook loads the App's dispatch function from the AppDispatch context.
 */
export default function useAppDispatch(): Dispatch<AppAction> {
  return useContext(AppDispatch);
}
