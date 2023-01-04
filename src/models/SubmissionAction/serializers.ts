import type { SerializedSubmissionActionRead } from '../../api/models/SerializedSubmissionActionRead';
import type * as SubmissionAction from './types';
import type * as InterviewScreenEntry from '../InterviewScreenEntry';

export function deserialize(
  serializedSubmissionAction: SerializedSubmissionActionRead,
): SubmissionAction.T {
  const fieldMappings = new Map(
    Object.entries(serializedSubmissionAction.fieldMappings).map(
      ([key, val]) => [
        key as SubmissionAction.FieldId,
        val as InterviewScreenEntry.Id,
      ],
    ),
  );

  return {
    ...serializedSubmissionAction,
    fieldMappings,
  };
}
