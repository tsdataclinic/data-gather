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
export type T = Readonly<
  {
    /** Which operation to use for the comparison */
    conditionalOperator: 'ALWAYS_EXECUTE' | '=' | '>' | '<' | '>=' | '<=';

    id: string;

    /**
     * The key within the response data which maps to the datum being compared.
     */
    responseKey: string;

    /** The value to compare the response datum to. */
    value: unknown;
  } & (
    | {
        /** Push some entries on to the stack */
        action: 'push';
        target: readonly string[];
      }
    | {
        /**
         * Skip the following question and add response data in place of the user
         */
        action: 'skip';
        target: Readonly<ResponseData>;
      }
    | {
        /**
         * Add a checkpoint, restore a checkpoint, or declare a milestone to be
         * passed
         */
        action: 'checkpoint' | 'restore' | 'milestone';
        target: string;
      }
  )
>;

type ConditionalActionType = T['action'];

/**
 * This is the serialized type as it is stored on the backend.
 * A serialized ConditionalAction can be represented by just its type
 * ('push', 'skip', etc.)
 */
export type SerializedT = {
  action: ConditionalActionType;
  conditionalOperator: '=' | '>' | '<' | '>=' | '<=';
  id: string;
  responseKey: string;
  target: string | string[] | ResponseData;
  value: unknown;
};

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
  const { action, target, ...condition } = rawObj;
  switch (action) {
    case 'push':
      invariant(
        isStringArray(target),
        '[ConditionalAction] Deserialization error. `target` must be an array of strings.',
      );
      return {
        ...condition,
        action,
        target,
      };
    case 'skip':
      invariant(
        isObject(target),
        '[ConditionalAction] Deserialization error. `target` must be an object.',
      );
      return {
        ...condition,
        action,
        target,
      };
    case 'checkpoint':
    case 'restore':
    case 'milestone':
      invariant(
        typeof target === 'string',
        '[ConditionalAction] Deserialization error. `target` must be a string.',
      );
      return {
        ...condition,
        action,
        target,
      };
    default:
      return assertUnreachable(action);
  }
}
