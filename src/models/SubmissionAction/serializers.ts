import invariant from 'invariant';
import type { SerializedSubmissionActionCreate } from '../../api/models/SerializedSubmissionActionCreate';
import type { SerializedSubmissionActionRead } from '../../api/models/SerializedSubmissionActionRead';
import * as SubmissionAction from './types';
import type * as InterviewScreenEntry from '../InterviewScreenEntry';
import assertUnreachable from '../../util/assertUnreachable';

export function deserialize(
  serializedSubmissionAction: SerializedSubmissionActionRead,
): SubmissionAction.T {
  const { type, fieldMappings, payload } = serializedSubmissionAction;

  const fieldMappingsObj = new Map(
    Object.entries(fieldMappings).map(([key, val]) => [
      key as SubmissionAction.FieldId,
      val as InterviewScreenEntry.Id,
    ]),
  );

  // deserialize the action config
  let deserializedConfig: SubmissionAction.T['config'];
  switch (type) {
    case SubmissionAction.ActionType.EDIT_ROW:
      invariant(
        'entryId' in payload,
        'Expected an entry id in an Edit Row payload',
      );
      deserializedConfig = {
        type,
        payload,
      };
      break;
    case SubmissionAction.ActionType.INSERT_ROW:
      invariant(
        'tableTarget' in payload,
        'Expected table target in an Insert Row payload',
      );
      deserializedConfig = {
        type,
        payload,
      };
      break;
    default:
      assertUnreachable(type);
  }

  return {
    ...serializedSubmissionAction,
    fieldMappings: fieldMappingsObj,
    config: deserializedConfig,
  };
}

function serializeFieldMappings(
  fieldMappings: ReadonlyMap<SubmissionAction.FieldId, string | undefined>,
): Record<string, string> {
  const fieldMappingsObj: Record<string, string> = {};
  fieldMappings.forEach((value, key) => {
    if (value !== undefined) {
      fieldMappingsObj[key] = value;
    }
  });
  return fieldMappingsObj;
}

export function serialize(
  submissionAction: SubmissionAction.T,
): SerializedSubmissionActionRead {
  const fieldMappings: Record<string, string> = serializeFieldMappings(
    submissionAction.fieldMappings,
  );
  const { payload, type } = submissionAction.config;
  return {
    ...submissionAction,
    type,
    payload,
    fieldMappings,
  };
}

export function serializeCreate(
  submissionAction: SubmissionAction.CreateT,
): SerializedSubmissionActionCreate {
  const { fieldMappings, config } = submissionAction;
  const fieldMappingsObj = serializeFieldMappings(fieldMappings);

  // validate the action payload
  const { type, payload } = config;
  let validPayload: SubmissionAction.T['config']['payload'];
  switch (type) {
    case SubmissionAction.ActionType.EDIT_ROW: {
      invariant(payload.entryId, 'Entry is missing in Edit Row configuration');
      invariant(
        payload.primaryKeyField,
        'Primary key field is missing in Edit Row configuration',
      );

      validPayload = {
        entryId: payload.entryId,
        primaryKeyField: payload.primaryKeyField,
      };
      break;
    }
    case SubmissionAction.ActionType.INSERT_ROW:
      invariant(
        payload.tableTarget,
        'Table target is missing in Insert Row configuration',
      );
      validPayload = {
        tableTarget: payload.tableTarget,
      };
      break;
    default:
      assertUnreachable(type);
  }

  return {
    ...submissionAction,
    type,
    payload: validPayload,
    fieldMappings: fieldMappingsObj,
  };
}
