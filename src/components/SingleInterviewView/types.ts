import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import * as ConditionalAction from '../../models/ConditionalAction';

export type EditableEntry =
  | InterviewScreenEntry.T
  | InterviewScreenEntry.CreateT;

export type EditableEntryWithScreen = EditableEntry & {
  readonly screen: InterviewScreen.T;
};

export type EditableAction = ConditionalAction.T | ConditionalAction.CreateT;
