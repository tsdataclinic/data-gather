import { ResponseData } from '@dataclinic/interview';
import invariant from 'invariant';
import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import nullsToUndefined from '../util/nullsToUndefined';
import { ActionType } from '../api/models/ActionType';
import { ConditionalOperator } from '../api/models/ConditionalOperator';
import { SerializedConditionalActionRead } from '../api/models/SerializedConditionalActionRead';
import { SerializedConditionalActionCreate } from '../api/models/SerializedConditionalActionCreate';

const PUSH_ACTION_DELIMITER = ';';

/**
 * An array of all all conditional operators. Useful for populating a list of
 * operators, e.g. for a dropdown.
 */
export const CONDITIONAL_OPERATORS: readonly ConditionalOperator[] =
  Object.values(ConditionalOperator);

/**
 * An array of all all action types. Useful for populating a list of
 * action types, e.g. for a dropdown.
 */
export const ACTION_TYPES: readonly ActionType[] = Object.values(ActionType);

/**
 * An action which may be executed after some response data is collected,
 * if a given condition is true (or, if the condition is 'ALWAYS_EXECUTE',
 * then always execute).
 *
 * Different values of the actionConfig field imply different datatypes
 * for the value of the payload field (e.g. a 'push' action takes a list
 * of screen IDs to push, a 'skip' action takes some response data).
 *
 * This is the serialized type as it is used on the frontend.
 */
interface ConditionalAction {
  /** The action to do if the condition evaluates to true */
  readonly actionConfig: Readonly<
    /** Push some entries on to the stack */
    | {
        payload: readonly string[];
        type: ActionType.PUSH;
      }
    /**
     * Skip the next screen and add response data in place of the user
     */
    | {
        payload: Readonly<ResponseData>;
        type: ActionType.SKIP;
      }
    /**
     * Add a checkpoint, restore a checkpoint, or declare a milestone to be
     * passed
     */
    | {
        payload: string;
        type: ActionType.CHECKPOINT | ActionType.RESTORE | ActionType.MILESTONE;
      }
  >;

  /** Which operation to use for the comparison */
  readonly conditionalOperator: ConditionalOperator;

  readonly id: string;

  /** The index of this action in the screen */
  readonly order: number;

  /**
   * The key within the response data which maps to the datum being compared.
   * While the `id` is fixed and not exposed to the user, this `responseKey` is
   * exposed to the user and can be changed.
   */
  readonly responseKey?: string;

  /**
   * For a given responseKey, an optionally associated lookup field. If the
   * response associated to the responseKey holds an object, then we take the
   * `responseKeyField` from that object.
   */
  readonly responseKeyField?: string;

  /** The screen that this action belongs to */
  readonly screenId: string;

  /** The value to compare the response datum to. */
  readonly value?: string;
}

type ConditionalActionCreate = Omit<ConditionalAction, 'id'> & {
  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  tempId: string;
};

export function create(vals: {
  order: number;
  screenId: string;
}): ConditionalActionCreate {
  return {
    actionConfig: { payload: [], type: ActionType.PUSH },
    conditionalOperator: ConditionalOperator.ALWAYS_EXECUTE,
    responseKey: undefined,
    responseKeyField: undefined,
    screenId: vals.screenId,
    value: undefined,
    order: vals.order,
    tempId: uuidv4(),
  };
}

// Helper predicate function to check if something is an object
function isObject(maybeObj: unknown): maybeObj is Record<string, unknown> {
  return (
    typeof maybeObj === 'object' &&
    maybeObj !== null &&
    !Array.isArray(maybeObj)
  );
}

/**
 * Validate if a conditional action is valid to be saved.
 * @returns {[boolean, string]} A tuple of whether or not validation passed,
 * and an error string if validation did not pass.
 */
export function validate(
  action: ConditionalAction | ConditionalActionCreate,
): [boolean, string] {
  // if we're **not** using the ALWAYS_EXECUTE operator then don't allow an
  // empty `responseKey` or an empty `value`
  if (action.conditionalOperator !== ConditionalOperator.ALWAYS_EXECUTE) {
    if (
      action.responseKey === undefined ||
      action.responseKey === '' ||
      action.value === undefined
    ) {
      return [
        false,
        `A '${action.conditionalOperator}' operator must have a responseKey and a value`,
      ];
    }
  }

  // do not allow Push actions to have an empty payload
  if (
    action.actionConfig.type === ActionType.PUSH &&
    action.actionConfig.payload.length === 0
  ) {
    return [false, 'A Push action cannot have an empty payload'];
  }

  return [true, ''];
}

/**
 * Convert from serialized type to deserialized.
 * This involves doing several type checks to make sure the backend is serving
 * the correct values. Otherwise, it means something went wrong during storage.
 */
export function deserialize(
  rawObj: SerializedConditionalActionRead,
): ConditionalAction {
  const { actionPayload, actionType, ...condition } = nullsToUndefined(rawObj);

  switch (actionType) {
    case ActionType.PUSH:
      return {
        ...condition,
        actionConfig: {
          payload: actionPayload.split(PUSH_ACTION_DELIMITER),
          type: actionType,
        },
      };
    case ActionType.SKIP:
      invariant(
        isObject(actionPayload),
        `[ConditionalAction] Deserialization error. 'actionPayload' must be an object.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionPayload,
          type: actionType,
        },
      };
    case ActionType.CHECKPOINT:
    case ActionType.RESTORE:
    case ActionType.MILESTONE:
      invariant(
        typeof actionPayload === 'string',
        `[ConditionalAction] Deserialization error. 'payload' must be a string.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionPayload,
          type: actionType,
        },
      };
    default:
      return assertUnreachable(actionType);
  }
}

function serializeActionPayload(
  payload: string | readonly string[] | Readonly<ResponseData>,
): string {
  if (Array.isArray(payload)) {
    return payload.join(PUSH_ACTION_DELIMITER);
  }
  if (typeof payload === 'object') {
    return JSON.stringify(payload);
  }
  return payload;
}

export function serialize(
  action: ConditionalAction,
): SerializedConditionalActionRead;
export function serialize(
  action: ConditionalActionCreate,
): SerializedConditionalActionCreate;
export function serialize(
  action: ConditionalAction | ConditionalActionCreate,
): SerializedConditionalActionRead | SerializedConditionalActionCreate;
export function serialize(
  action: ConditionalAction | ConditionalActionCreate,
): SerializedConditionalActionRead | SerializedConditionalActionCreate {
  // validate the conditional action before serializing to make sure it's safe to store
  const [isValid, errorMsg] = validate(action);
  invariant(isValid, errorMsg);

  const { actionConfig, ...conditionalAction } = action;
  return {
    ...conditionalAction,
    actionPayload: serializeActionPayload(actionConfig.payload),
    actionType: actionConfig.type,
  };
}

/**
 * Convert a ConditionalOperator to a string. Useful if listing operators
 * in a dropdown.
 */
export function operatorToDisplayString(operator: ConditionalOperator): string {
  switch (operator) {
    case ConditionalOperator.ALWAYS_EXECUTE:
      return 'Always execute';
    case ConditionalOperator.AFTER:
      return 'After';
    case ConditionalOperator.BEFORE:
      return 'Before';
    case ConditionalOperator.EQ:
      return '=';
    case ConditionalOperator.GT:
      return '>';
    case ConditionalOperator.GTE:
      return '≥';
    case ConditionalOperator.LT:
      return '<';
    case ConditionalOperator.LTE:
      return '≤';
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

export function isTimeOperator(operator: ConditionalOperator): boolean {
  switch (operator) {
    case ConditionalOperator.AFTER:
    case ConditionalOperator.BEFORE:
      return true;
    case ConditionalOperator.ALWAYS_EXECUTE:
    case ConditionalOperator.EQ:
    case ConditionalOperator.GT:
    case ConditionalOperator.GTE:
    case ConditionalOperator.LT:
    case ConditionalOperator.LTE:
      return false;
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

/**
 * Convert an ActionType to a string. Useful if listing action types in
 * a dropdown.
 */
export function actionTypeToDisplayString(
  actionType: ActionType | undefined,
): string {
  if (actionType === undefined) {
    return '';
  }
  // capitalize first letter
  return actionType[0].toUpperCase() + actionType.substring(1);
}

/**
 * Create a default action config (with a default payload) given an `actionType`
 */
export function createDefaultActionConfig(
  actionType: ActionType,
): ConditionalAction['actionConfig'] {
  switch (actionType) {
    case ActionType.PUSH:
      return {
        payload: [],
        type: actionType,
      };
    case ActionType.SKIP:
      return {
        payload: {},
        type: actionType,
      };
    case ActionType.CHECKPOINT:
    case ActionType.RESTORE:
    case ActionType.MILESTONE:
      return {
        payload: '',
        type: actionType,
      };
    default:
      return assertUnreachable(actionType);
  }
}

export type { ConditionalAction as T };
export type { ConditionalActionCreate as CreateT };
export type { SerializedConditionalActionRead as SerializedT };
export { ConditionalOperator };
export { ActionType };
