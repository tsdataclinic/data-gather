import { ResponseData } from '@dataclinic/interview';
import invariant from 'invariant';
import { v4 as uuidv4 } from 'uuid';
import { Indexable } from '../util/Indexable';
import assertUnreachable from '../util/assertUnreachable';
import nullsToUndefined from '../util/nullsToUndefined';

export enum ConditionalOperator {
  AlwaysExecute = 'ALWAYS_EXECUTE',
  Equals = '=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
}

export enum ActionType {
  Checkpoint = 'checkpoint',
  Milestone = 'milestone',
  Push = 'push',
  Restore = 'restore',
  Skip = 'skip',
}

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
        type: ActionType.Push;
      }
    /**
     * Skip the next screen and add response data in place of the user
     */
    | {
        payload: Readonly<ResponseData>;
        type: ActionType.Skip;
      }
    /**
     * Add a checkpoint, restore a checkpoint, or declare a milestone to be
     * passed
     */
    | {
        payload: string;
        type: ActionType.Checkpoint | ActionType.Restore | ActionType.Milestone;
      }
  >;

  /** Which operation to use for the comparison */
  readonly conditionalOperator: ConditionalOperator;

  readonly id: string;

  /**
   * The key within the response data which maps to the datum being compared.
   */
  readonly responseKey: string | undefined;

  /** The screen that this action belongs to */
  readonly screenId: string;

  /** The value to compare the response datum to. */
  readonly value: string | undefined;
}

/**
 * This is the serialized type as it is stored on the backend.
 * A serialized ConditionalAction can be represented by just its type
 * ('push', 'skip', etc.)
 */
interface SerializedConditionalAction extends Indexable {
  actionPayload: string | string[] | ResponseData;
  actionType: ActionType;
  conditionalOperator: ConditionalOperator;
  id: string;
  responseKey: string | null;
  screenId: string;
  value: string | null;
}

export function create(vals: { screenId: string }): ConditionalAction {
  return {
    actionConfig: { payload: [], type: ActionType.Push },
    conditionalOperator: ConditionalOperator.AlwaysExecute,
    id: uuidv4(),
    responseKey: undefined,
    screenId: vals.screenId,
    value: undefined,
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

// Helper predicate function to check if something is a string array
function isStringArray(maybeArr: unknown): maybeArr is string[] {
  return (
    Array.isArray(maybeArr) &&
    (maybeArr.length === 0 || typeof maybeArr[0] === 'string')
  );
}

/**
 * Validate if a conditional action is valid to be saved.
 * @returns {[boolean, string]} A tuple of whether or not validation passed,
 * and an error string if validation did not pass.
 */
export function validate(action: ConditionalAction): [boolean, string] {
  // if we're **not** using the ALWAYS_EXECUTE operator then don't allow an
  // empty `responseKey` or an empty `value`
  if (action.conditionalOperator !== ConditionalOperator.AlwaysExecute) {
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
    action.actionConfig.type === ActionType.Push &&
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
  rawObj: SerializedConditionalAction,
): ConditionalAction {
  const { actionPayload, actionType, ...condition } = nullsToUndefined(rawObj);

  switch (actionType) {
    case ActionType.Push:
      invariant(
        isStringArray(actionPayload),
        `[ConditionalAction] Deserialization error. 'actionPayload' must be an array of strings.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionPayload,
          type: actionType,
        },
      };
    case ActionType.Skip:
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
    case ActionType.Checkpoint:
    case ActionType.Restore:
    case ActionType.Milestone:
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

export function serialize(
  conditionalAction: ConditionalAction,
): SerializedConditionalAction {
  // validate the conditional action before serializing to make sure it's safe to store
  const [isValid, errorMsg] = validate(conditionalAction);
  invariant(isValid, errorMsg);

  const {
    actionConfig,
    conditionalOperator,
    id,
    responseKey,
    screenId,
    value,
  } = conditionalAction;
  return {
    actionPayload: actionConfig.payload,
    actionType: actionConfig.type,
    conditionalOperator,
    id,
    responseKey: responseKey ?? null,
    screenId,
    value: value ?? null,
  };
}

/**
 * Convert a ConditionalOperator to a string. Useful if listing operators
 * in a dropdown.
 */
export function operatorToDisplayString(operator: ConditionalOperator): string {
  switch (operator) {
    case ConditionalOperator.AlwaysExecute:
      return 'Always execute';
    default:
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
 * Returns an action corresponding to the given id from a list of action
 *
 * @param actionId
 * @param actions
 */
export function getActionById(
  actionId: string,
  actions: ConditionalAction[] | undefined,
): ConditionalAction | undefined {
  if (actions === undefined) {
    return undefined;
  }

  return actions.find(entry => entry.id === actionId);
}

/**
 * Create a default action config (with a default payload) given an `actionType`
 */
export function createDefaultActionConfig(
  actionType: ActionType,
): ConditionalAction['actionConfig'] {
  switch (actionType) {
    case ActionType.Push:
      return {
        payload: [],
        type: actionType,
      };
    case ActionType.Skip:
      return {
        payload: {},
        type: actionType,
      };
    case ActionType.Checkpoint:
    case ActionType.Restore:
    case ActionType.Milestone:
      return {
        payload: '',
        type: actionType,
      };
    default:
      return assertUnreachable(actionType);
  }
}

export type { ConditionalAction as T };
export type { SerializedConditionalAction as SerializedT };
