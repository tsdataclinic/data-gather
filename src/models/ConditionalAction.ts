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
  actionTarget: string | string[] | ResponseData;
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

/**
 * Validate if a conditional action is valid to be saved.
 */
export function validate(action: ConditionalAction): boolean {
  // if we're **not** using the ALWAYS_EXECUTE operator then don't allow an
  // empty `responseKey` or an empty `value`
  if (action.conditionalOperator !== ConditionalOperator.AlwaysExecute) {
    if (
      action.responseKey === undefined ||
      action.responseKey === '' ||
      action.value === undefined
    ) {
      return false;
    }
  }

  // do not allow Push actions to have an empty payload
  if (
    action.actionConfig.type === ActionType.Push &&
    action.actionConfig.payload.length === 0
  ) {
    return false;
  }

  return true;
}

function isObject(maybeObj: unknown): maybeObj is Record<string, unknown> {
  return (
    typeof maybeObj === 'object' &&
    maybeObj !== null &&
    !Array.isArray(maybeObj)
  );
}

function isStringArray(maybeArr: unknown): maybeArr is string[] {
  return (
    Array.isArray(maybeArr) &&
    (maybeArr.length === 0 || typeof maybeArr[0] === 'string')
  );
}

/**
 * Convert from serialized type to deserialized.
 * This involves doing several type checks to make sure the backend is serving
 * the correct values. Otherwise, it means something went wrong during storage.
 */
export function deserialize(
  rawObj: SerializedConditionalAction,
): ConditionalAction {
  const { actionTarget, actionType, ...condition } = nullsToUndefined(rawObj);

  switch (actionType) {
    case ActionType.Push:
      invariant(
        isStringArray(actionTarget),
        `[ConditionalAction] Deserialization error. 'actionTarget' must be an array of strings.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionTarget,
          type: actionType,
        },
      };
    case ActionType.Skip:
      invariant(
        isObject(actionTarget),
        `[ConditionalAction] Deserialization error. 'actionTarget' must be an object.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionTarget,
          type: actionType,
        },
      };
    case ActionType.Checkpoint:
    case ActionType.Restore:
    case ActionType.Milestone:
      invariant(
        typeof actionTarget === 'string',
        `[ConditionalAction] Deserialization error. 'payload' must be a string.`,
      );
      return {
        ...condition,
        actionConfig: {
          payload: actionTarget,
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
  const {
    actionConfig,
    conditionalOperator,
    id,
    responseKey,
    screenId,
    value,
  } = conditionalAction;
  return {
    actionTarget: actionConfig.payload,
    actionType: actionConfig.type,
    conditionalOperator,
    id,
    responseKey: responseKey ?? null,
    screenId,
    value: value ?? null,
  };
}

export function operatorToDisplayString(operator: ConditionalOperator): string {
  switch (operator) {
    case ConditionalOperator.AlwaysExecute:
      return 'Always execute';
    default:
      return operator;
  }
}

export function actionTypeToDisplayString(actionType: ActionType): string {
  // capitalize first letter
  return actionType[0].toUpperCase() + actionType.substring(1);
}

export type { ConditionalAction as T };
export type { SerializedConditionalAction as SerializedT };
