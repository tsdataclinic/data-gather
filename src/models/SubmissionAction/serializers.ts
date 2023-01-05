import invariant from 'invariant';
import type { SerializedSubmissionActionCreate } from '../../api/models/SerializedSubmissionActionCreate';
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

export function serialize(
  submissionAction: SubmissionAction.CreateT | SubmissionAction.T,
): SerializedSubmissionActionCreate | SerializedSubmissionActionRead {
  const fieldMappings: Record<string, string> = {};
  submissionAction.fieldMappings.forEach((value, key) => {
    if (value !== undefined) {
      fieldMappings[key] = value;
    }
  });
  const { target } = submissionAction;

  invariant(target, 'A target must exist before an action can be serialized');

  return {
    ...submissionAction,
    target,
    fieldMappings,
  };
}
