import { SubmissionActionType } from '../../api/models/SubmissionActionType';
import { SerializedSubmissionActionRead } from '../../api/models/SerializedSubmissionActionRead';
import * as InterviewScreenEntry from '../InterviewScreenEntry';

export type FieldId = string & { __type: 'FieldId' };

/**
 * An action that is executed on interview submission.
 */
type SubmissionAction = {
  readonly fieldMappings: ReadonlyMap<
    FieldId,
    InterviewScreenEntry.Id | undefined
  >;
  readonly id: string;
  readonly interviewId: string;
  readonly order: number;
  readonly target: string;
  readonly type: SubmissionActionType;
};

type SubmissionActionCreate = Omit<SubmissionAction, 'id' | 'target'> & {
  /**
   * The `target` is empty at first until a user fills this out.
   */
  target?: string;

  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  tempId: string;
};

export type { SubmissionAction as T };
export type { SubmissionActionCreate as CreateT };
export type { SerializedSubmissionActionRead as SerializedT };
export { SubmissionActionType as ActionType };
