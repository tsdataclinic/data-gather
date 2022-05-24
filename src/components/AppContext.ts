import { createContext } from 'react';
import { Interview } from '../types';

export type AppGlobalState = {
  allInterviews: readonly Interview[];
};

const DEFAULT_CONTEXT = {
  allInterviews: [],
};

export default createContext<AppGlobalState>(DEFAULT_CONTEXT);
