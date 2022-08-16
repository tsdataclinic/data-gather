import { ResponseData } from '@dataclinic/interview';
import invariant from 'invariant';
import assertUnreachable from '../util/assertUnreachable';

/**
 * An action which may be executed after some response data is collected,
 * if a given condition is true (or, if the condition is 'ALWAYS_EXECUTE',
 * then always execute).
 *
 * Different values of the action field imply different datatypes
 * for the value of the target field (e.g. a 'push' action takes a list
 * of question IDs to push, a 'skip' action takes some response data).
 *
 * This is the serialized type as it is used on the frontend.
 */
export interface T {
  /** The action to do if the condition evaluates to true */
  readonly action: Readonly<
    /** Push some entries on to the stack */
    | {
        target: readonly string[];
        type: 'push';
      }
    /**
     * Skip the following question and add response data in place of the user
     */
    | {
        target: Readonly<ResponseData>;
        type: 'skip';
      }
    /**
     * Add a checkpoint, restore a checkpoint, or declare a milestone to be
     * passed
     */
    | {
        target: string;
        type: 'checkpoint' | 'restore' | 'milestone';
      }
  >;

  /** Which operation to use for the comparison */
  readonly conditionalOperator:
    | 'ALWAYS_EXECUTE'
    | '='
    | '>'
    | '<'
    | '>='
    | '<=';

  readonly id: string;

  /**
   * The key within the response data which maps to the datum being compared.
   */
  readonly responseKey: string;

  /** The value to compare the response datum to. */
  readonly value: unknown;
}

type ConditionalActionType = T['action']['type'];

/**
 * This is the serialized type as it is stored on the backend.
 * A serialized ConditionalAction can be represented by just its type
 * ('push', 'skip', etc.)
 */
export interface SerializedT {
  actionTarget: string | string[] | ResponseData;
  actionType: ConditionalActionType;
  conditionalOperator: '=' | '>' | '<' | '>=' | '<=';
  id: string;
  responseKey: string;
  value: unknown;
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
export function deserialize(rawObj: SerializedT): T {
  const { actionTarget, actionType, ...condition } = rawObj;
  switch (actionType) {
    case 'push':
      invariant(
        isStringArray(actionTarget),
        `[ConditionalAction] Deserialization error. 'actionTarget' must be an array of strings.`,
      );
      return {
        ...condition,
        action: {
          target: actionTarget,
          type: actionType,
        },
      };
    case 'skip':
      invariant(
        isObject(actionTarget),
        `[ConditionalAction] Deserialization error. 'actionTarget' must be an object.`,
      );
      return {
        ...condition,
        action: {
          target: actionTarget,
          type: actionType,
        },
      };
    case 'checkpoint':
    case 'restore':
    case 'milestone':
      invariant(
        typeof actionTarget === 'string',
        `[ConditionalAction] Deserialization error. 'target' must be a string.`,
      );
      return {
        ...condition,
        action: {
          target: actionTarget,
          type: actionType,
        },
      };
    default:
      return assertUnreachable(actionType);
  }
}
