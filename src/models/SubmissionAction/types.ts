import { SubmissionActionType } from '../../api/models/SubmissionActionType';
import { SerializedSubmissionActionRead } from '../../api/models/SerializedSubmissionActionRead';
import { SpecialValueType } from '../../api/models/SpecialValueType';
import * as InterviewScreenEntry from '../InterviewScreenEntry';

export type FieldId = string & { __type: 'FieldId' };

export type EditRowActionConfig = {
  /**
   * Edit a row. The primary key of the row is identified by taking the
   * response of an entry (which should be an object) and taking the value
   * inside the `primaryKeyField`
   * and we use the `responseKeyField`
   */
  payload: {
    entryId: string;
    primaryKeyField: string;
  };
  type: SubmissionActionType.EDIT_ROW;
};

export type InsertRowActionConfig = {
  /**
   * Insert a row. The `tableTarget` represents the table we will insert
   * into.
   */
  payload: {
    tableTarget: string;
  };
  type: SubmissionActionType.INSERT_ROW;
};

export type EntryResponseLookupConfig = {
  entryId?: InterviewScreenEntry.Id;
  responseFieldKey?: string;
  specialValueType?: SpecialValueType;
};

/**
 * An action that is executed on interview submission.
 */
type SubmissionAction = {
  readonly config: EditRowActionConfig | InsertRowActionConfig;
  readonly fieldMappings: ReadonlyMap<FieldId, EntryResponseLookupConfig>;
  readonly id: string;
  readonly interviewId: string;
  readonly order: number;
};

export type WithPartialPayload<Config extends SubmissionAction['config']> =
  // this is a weird trick in TypeScript in order to distribute an expression
  // over a union but in a way that preserves the ability to narrow the types
  Config extends unknown
    ? {
        payload: Partial<Config['payload']>;
        type: Config['type'];
      }
    : never;

type SubmissionActionCreate = Omit<SubmissionAction, 'id' | 'config'> & {
  readonly config: WithPartialPayload<SubmissionAction['config']>;

  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  readonly tempId: string;
};

export type { SubmissionAction as T };
export type { SubmissionActionCreate as CreateT };
export type { SerializedSubmissionActionRead as SerializedT };
export { SubmissionActionType as ActionType };
export { SpecialValueType };
