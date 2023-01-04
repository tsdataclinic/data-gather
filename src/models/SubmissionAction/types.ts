import { SubmissionActionType } from '../../api/models/SubmissionActionType';
import { SerializedSubmissionActionRead } from '../../api/models/SerializedSubmissionActionRead';
import * as InterviewScreenEntry from '../InterviewScreenEntry';

export type FieldId = string & { __type: 'FieldId' };

/**
 * An action that is executed on interview submission.
 */
type SubmissionAction = {
  readonly fieldMappings: ReadonlyMap<FieldId, InterviewScreenEntry.Id>;
  readonly id: string;
  readonly interviewId: string;
  readonly order: number;
  readonly target: string;
  readonly type: SubmissionActionType;
};

export type { SubmissionAction as T };
export type { SerializedSubmissionActionRead as SerializedT };
export { SubmissionActionType as ActionType };
