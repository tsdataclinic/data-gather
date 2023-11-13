import * as R from 'remeda';
import invariant from 'invariant';
import { v4 as uuidv4 } from 'uuid';
import assertUnreachable from '../util/assertUnreachable';
import { ActionType } from '../api/models/ActionType';
import { ConditionalOperator } from '../api/models/ConditionalOperator';
import { SerializedConditionalActionRead } from '../api/models/SerializedConditionalActionRead';
import { SerializedConditionalActionCreate } from '../api/models/SerializedConditionalActionCreate';
import { ResponseData } from '../script/types';
import { SerializedIfClause } from '../api/models/SerializedIfClause';
import { SerializedActionConfig } from '../api/models/SerializedActionConfig';
import { SerializedConditionGroup } from '../api/models/SerializedConditionGroup';
import { ConditionGroupType } from '../api/models/ConditionGroupType';
import { SerializedSingleCondition } from '../api';

const PUSH_ACTION_DELIMITER = ';';

/**
 * An array of all all conditional operators. Useful for populating a list of
 * operators, e.g. for a dropdown.
 */
export const CONDITIONAL_OPERATORS: readonly ConditionalOperator[] = [
  'after_or_equal',
  'after',
  'equals_date',
  'before',
  'before_or_equal',
  'eq',
  'gt',
  'gte',
  'lt',
  'lte',
  'always_execute',
  'is_empty',
  'is_not_empty',
];

/**
 * An array of all all action types. Useful for populating a list of
 * action types, e.g. for a dropdown.
 */
export const ACTION_TYPES: readonly ActionType[] = [
  'checkpoint',
  'do_nothing',
  'milestone',
  'push',
  'restore',
  'skip',
  'end_interview',
];

export type ConditionalOperatorGroupType = 'generic' | 'date' | 'number';

export type SingleCondition = {
  /** Which operation to use for the comparison */
  readonly conditionalOperator: ConditionalOperator;

  /** An id to identify this condition */
  readonly id: string;

  /**
   * The key within the response data which maps to the datum being compared.
   * While the `id` is fixed and not exposed to the user, this `responseKey` is
   * exposed to the user and can be changed.
   *
   * If the `conditionalOperator` is ALWAYS_EXECUTE then there is no
   * `responseKey` that is needed, so this field is undefined.
   */
  readonly responseKey?: string;

  /**
   * For a given responseKey, an optionally associated lookup field. If the
   * response associated to the responseKey holds an object, then we take the
   * `responseKeyLookupField` from that object.
   */
  readonly responseKeyLookupField?: string;

  /**
   * The value to compare the response datum to.
   *
   * If the `conditionalOperator` is ALWAYS_EXECUTE then there is no
   * `value` that is needed, so this field is undefined.
   * */
  readonly value?: string;
};

export type ConditionGroup = AndGroup | OrGroup;
export type AndGroup = {
  readonly conditions: ReadonlyArray<ConditionGroup | SingleCondition>;

  /** An id to identify this condition group */
  readonly id: string;
  readonly type: 'and';
};
export type OrGroup = {
  readonly conditions: ReadonlyArray<ConditionGroup | SingleCondition>;

  /** An id to identify this condition group */
  readonly id: string;
  readonly type: 'or';
};

export type IfClause = {
  readonly action: ActionConfig;
  readonly conditionGroup: ConditionGroup;
  readonly elseClause: ElseClause;

  /** An id to identify this clause */
  readonly id: string;
};

export type ElseClause = ActionConfig | IfClause;

/** The action to do if the condition evaluates to true */
export type ActionConfig = {
  /**
   * An id to identify this individual config, because a ConditionalAction
   * may actually consist of many actions (e.g. an action if True and an
   * action if False)
   */
  id: string;
} & (
  | {
      /** End the interview */
      type: 'end_interview';
    }
  | {
      /** Do nothing */
      type: 'do_nothing';
    }
  | {
      /** Push some entries on to the stack */
      payload: readonly string[];
      type: 'push';
    }
  | {
      /**
       * Skip the next screen and add response data in place of the user
       */
      payload: Readonly<ResponseData>;
      type: 'skip';
    }
  | {
      /**
       * Add a checkpoint, restore a checkpoint, or declare a milestone to be
       * passed
       */
      payload: string;
      type: 'checkpoint' | 'restore' | 'milestone';
    }
);

/**
 * An action which may be executed after some response data is collected.
 * The `ifClause` is evaluated to determine which action to execute.
 *
 * Different values of the actionConfig field imply different datatypes
 * for the value of the payload field (e.g. a 'push' action takes a list
 * of screen IDs to push, a 'skip' action takes some response data).
 *
 * This is the serialized type as it is used on the frontend.
 */
interface ConditionalAction {
  /** The id to represent the entire conditional action */
  readonly id: string;
  readonly ifClause: IfClause;

  /** The index of this action in the screen */
  readonly order: number;

  /** The screen that this action belongs to */
  readonly screenId: string;
}

type ConditionalActionCreate = Omit<ConditionalAction, 'id'> & {
  /**
   * A temp id used only for identification purposes in the frontend (e.g.
   * for React keys)
   */
  readonly tempId: string;
};

export function createDefaultSingleCondition(): SingleCondition {
  return {
    id: uuidv4(),
    conditionalOperator: 'eq',
    responseKey: undefined,
    value: undefined,
  };
}

export function createDefaultConditionGroup(
  groupType: ConditionGroupType = 'and',
): ConditionGroup {
  return {
    id: uuidv4(),
    type: groupType,
    conditions: [createDefaultSingleCondition()],
  };
}

/**
 * Create a default action config (with a default payload) given an `actionType`
 */
export function createDefaultActionConfig(
  actionType: ActionType,
): ActionConfig {
  const id = uuidv4();

  switch (actionType) {
    case 'push':
      return { id, payload: [], type: actionType };
    case 'skip':
      return { id, payload: {}, type: actionType };
    case 'checkpoint':
    case 'restore':
    case 'milestone':
      return {
        id,
        payload: '',
        type: actionType,
      };
    case 'end_interview':
    case 'do_nothing':
      return { id, type: actionType };
    default:
      return assertUnreachable(actionType);
  }
}

export function createDefaultIfClause(): IfClause {
  return {
    id: uuidv4(),
    action: createDefaultActionConfig('push'),
    conditionGroup: createDefaultConditionGroup(),
    elseClause: createDefaultActionConfig('push'),
  };
}

export function create(vals: {
  order: number;
  screenId: string;
}): ConditionalActionCreate {
  return {
    ifClause: createDefaultIfClause(),
    screenId: vals.screenId,
    order: vals.order,
    tempId: uuidv4(),
  };
}

/**
 * Convert a ConditionalOperator to a string. Useful if listing operators
 * in a dropdown.
 */
export function operatorToDisplayString(operator: ConditionalOperator): string {
  switch (operator) {
    case 'always_execute':
      return 'Always execute';
    case 'after':
      return 'After';
    case 'before':
      return 'Before';
    case 'after_or_equal':
      return 'After or equal';
    case 'before_or_equal':
      return 'Before or equal';
    case 'equals_date':
      return 'Is on day';
    case 'eq':
      return 'Equals';
    case 'gt':
      return '>';
    case 'gte':
      return '≥';
    case 'lt':
      return '<';
    case 'lte':
      return '≤';
    case 'is_empty':
      return 'Is empty';
    case 'is_not_empty':
      return 'Is not empty';
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

export function isSingleCondition(
  condition: SerializedSingleCondition | SerializedConditionGroup,
): condition is SerializedSingleCondition;
export function isSingleCondition(
  condition: SingleCondition | ConditionGroup,
): condition is SingleCondition;
export function isSingleCondition(
  condition:
    | SingleCondition
    | ConditionGroup
    | SerializedSingleCondition
    | SerializedConditionGroup,
): condition is SingleCondition {
  return 'conditionalOperator' in condition;
}

export function isCreateType(
  action: ConditionalAction | ConditionalActionCreate,
): action is ConditionalActionCreate {
  return 'tempId' in action;
}

export function isIfClause(
  obj: SerializedActionConfig | SerializedIfClause,
): obj is SerializedIfClause;
export function isIfClause(obj: ActionConfig | IfClause): obj is IfClause;
export function isIfClause(
  obj: ActionConfig | IfClause | SerializedActionConfig | SerializedIfClause,
): obj is IfClause {
  return 'conditionGroup' in obj;
}

export function traverseConditionGroup(
  conditionGroup: ConditionGroup,
  callbacks: {
    processConditionGroup?: (conditionGroup: ConditionGroup) => unknown;
    processSingleCondition?: (condition: SingleCondition) => unknown;
  },
): void {
  const { processConditionGroup, processSingleCondition } = callbacks;
  if (processConditionGroup) {
    processConditionGroup(conditionGroup);
  }
  conditionGroup.conditions.forEach(condition => {
    if (isSingleCondition(condition)) {
      if (processSingleCondition) {
        processSingleCondition(condition);
      }
    } else {
      traverseConditionGroup(condition, callbacks);
    }
  });
}

export function traverseIfClause(
  ifClause: IfClause,
  callbacks: {
    processAction?: (actionConfig: ActionConfig) => unknown;
    processConditionGroup?: (conditionGroup: ConditionGroup) => unknown;
    processIfClause?: (ifClause: IfClause) => unknown;
    processSingleCondition?: (condition: SingleCondition) => unknown;
  },
): void {
  const {
    processAction,
    processConditionGroup,
    processSingleCondition,
    processIfClause,
  } = callbacks;

  if (processIfClause) {
    processIfClause(ifClause);
  }
  if (processAction) {
    processAction(ifClause.action);
  }

  traverseConditionGroup(ifClause.conditionGroup, {
    processConditionGroup,
    processSingleCondition,
  });

  if (isIfClause(ifClause.elseClause)) {
    traverseIfClause(ifClause.elseClause, callbacks);
  } else if (processAction) {
    processAction(ifClause.elseClause);
  }
}

/**
 * Validate if a conditional action is valid to be saved.
 * @returns {[boolean, string]} A tuple of whether or not validation passed,
 * and an error string if validation did not pass.
 */
export function validate(
  action: ConditionalAction | ConditionalActionCreate,
): [boolean, string] {
  const { ifClause } = action;

  // collect all actions and conditions to validate each of them
  const allActions: ActionConfig[] = [];
  const allConditions: SingleCondition[] = [];
  const allConditionGroups: ConditionGroup[] = [];
  traverseIfClause(ifClause, {
    processAction: actionConfig => allActions.push(actionConfig),
    processConditionGroup: conditionGroup =>
      allConditionGroups.push(conditionGroup),
    processSingleCondition: condition => allConditions.push(condition),
  });

  // first, validate that there are no empty condition groups
  if (allConditionGroups.some(group => group.conditions.length === 0)) {
    return [false, 'You cannot have a condition group with 0 conditions'];
  }

  // next, validate the use of ALWAYS_EXECUTE:
  // - only the first condition can be ALWAYS_EXECUTE
  // - if it is, it should be the *only* condition
  const [firstCondition, ...restOfConditions] = allConditions;
  if (
    restOfConditions.some(
      condition => condition.conditionalOperator === 'always_execute',
    )
  ) {
    return [
      false,
      'Only the top-level condition should be configurable to always execute',
    ];
  }
  if (
    firstCondition.conditionalOperator === 'always_execute' &&
    restOfConditions.length > 1
  ) {
    return [
      false,
      'If the first condition is always executable then there should be no other conditions',
    ];
  }

  // now evaluate that all conditions are fully specified
  const errorValidatingCondition = R.pipe(
    allConditions,
    R.map((condition: SingleCondition): [boolean, string] | undefined => {
      const { conditionalOperator, responseKey, value } = condition;
      // if we're **not** using the ALWAYS_EXECUTE operator then don't allow an
      // empty `responseKey` or an empty `value`
      if (conditionalOperator !== 'always_execute') {
        const operatorName = operatorToDisplayString(conditionalOperator);
        if (responseKey === undefined || responseKey === '') {
          return [
            false,
            `A '${operatorName}' condition must select a question to compare to`,
          ];
        }
        if (
          value === undefined &&
          conditionalOperator !== 'is_not_empty' &&
          conditionalOperator !== 'is_empty'
        ) {
          return [false, `A '${operatorName}' condition must have a value`];
        }
      }
      return undefined;
    }),
    R.compact,
    R.first(),
  );

  // now evaluate that all actions are fully specified
  const errorValidatingAction = R.pipe(
    allActions,
    R.map((actionConfig: ActionConfig): [boolean, string] | undefined => {
      // do not allow Push actions to have an empty payload
      if (actionConfig.type === 'push' && actionConfig.payload.length === 0) {
        return [false, 'Missing next stage for action'];
      }
      return undefined;
    }),
    R.compact,
    R.first(),
  );

  if (errorValidatingCondition) {
    return errorValidatingCondition;
  }

  if (errorValidatingAction) {
    return errorValidatingAction;
  }

  return [true, ''];
}

function deserializeActionConfig(
  serializedActionConfig: SerializedActionConfig,
): ActionConfig {
  const { id, payload, type } = serializedActionConfig;
  const actionPayload = payload ?? '';

  switch (type) {
    case 'end_interview':
    case 'do_nothing':
      return { id, type };
    case 'push':
      return {
        id,
        type,
        payload: actionPayload.split(PUSH_ACTION_DELIMITER),
      };
    case 'skip':
      return {
        id,
        type,
        payload: JSON.parse(actionPayload),
      };
    case 'checkpoint':
    case 'restore':
    case 'milestone':
      invariant(
        typeof actionPayload === 'string',
        `[ConditionalAction] Deserialization error. 'payload' must be a string.`,
      );
      return {
        id,
        type,
        payload: actionPayload,
      };
    default:
      return assertUnreachable(type);
  }
}

function deserializeConditionGroup(
  serializedConditionGroup: SerializedConditionGroup,
): ConditionGroup {
  const { id, type, conditions } = serializedConditionGroup;
  return {
    id,
    type,
    conditions: conditions.map(serializedCondition =>
      isSingleCondition(serializedCondition)
        ? serializedCondition
        : deserializeConditionGroup(serializedConditionGroup),
    ),
  };
}

function deserializeIfClause(serializedIfClause: SerializedIfClause): IfClause {
  const { id, action, conditionGroup, elseClause } = serializedIfClause;
  return {
    id,
    action: deserializeActionConfig(action),
    conditionGroup: deserializeConditionGroup(conditionGroup),
    elseClause: isIfClause(elseClause)
      ? deserializeIfClause(elseClause)
      : deserializeActionConfig(elseClause),
  };
}

/**
 * Convert from serialized type to deserialized.
 * This involves doing several type checks to make sure the backend is serving
 * the correct values. Otherwise, it means something went wrong during storage.
 */
export function deserialize(
  rawObj: SerializedConditionalActionRead,
): ConditionalAction {
  const { ifClause, ...restOfAction } = rawObj;
  return {
    ...restOfAction,
    ifClause: deserializeIfClause(ifClause),
  };
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

function serializeActionConfig(
  actionConfig: ActionConfig,
): SerializedActionConfig {
  const { id, type } = actionConfig;
  return {
    id,
    type,
    payload:
      'payload' in actionConfig
        ? serializeActionPayload(actionConfig.payload)
        : undefined,
  };
}

function serializeConditionGroup(
  conditionGroup: ConditionGroup,
): SerializedConditionGroup {
  const { id, type, conditions } = conditionGroup;
  return {
    id,
    type,
    conditions: conditions.map(condition =>
      isSingleCondition(condition)
        ? condition
        : serializeConditionGroup(condition),
    ),
  };
}

function serializeIfClause(ifClause: IfClause): SerializedIfClause {
  const { id, action, conditionGroup, elseClause } = ifClause;
  return {
    id,
    action: serializeActionConfig(action),
    conditionGroup: serializeConditionGroup(conditionGroup),
    elseClause: isIfClause(elseClause)
      ? serializeIfClause(elseClause)
      : serializeActionConfig(elseClause),
  };
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

  const { ifClause, ...restOfAction } = action;
  return {
    ...restOfAction,
    ifClause: serializeIfClause(ifClause),
  };
}

// TODO: eventually track a registry of all operators to their configurations,
//   E.g. { EQ: { displayName: 'abc', groupType: 'date', requiresValue: true } }
export function isDateOperator(operator: ConditionalOperator): boolean {
  switch (operator) {
    case 'after':
    case 'after_or_equal':
    case 'before':
    case 'before_or_equal':
    case 'equals_date':
      return true;
    case 'always_execute':
    case 'eq':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
    case 'is_empty':
    case 'is_not_empty':
      return false;
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

export function isGenericOperator(operator: ConditionalOperator): boolean {
  switch (operator) {
    case 'is_empty':
    case 'is_not_empty':
    case 'eq':
      return true;
    case 'always_execute':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
    case 'after':
    case 'after_or_equal':
    case 'before':
    case 'before_or_equal':
    case 'equals_date':
      return false;
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

export function isNumberOperator(operator: ConditionalOperator): boolean {
  switch (operator) {
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return true;
    case 'eq':
    case 'after':
    case 'after_or_equal':
    case 'before':
    case 'before_or_equal':
    case 'equals_date':
    case 'always_execute':
    case 'is_empty':
    case 'is_not_empty':
      return false;
    default:
      assertUnreachable(operator, { throwError: false });
      return operator;
  }
}

export function isOperatorOfGroupType(
  operator: ConditionalOperator,
  groupType: ConditionalOperatorGroupType,
): boolean {
  switch (groupType) {
    case 'date':
      return isDateOperator(operator);
    case 'number':
      return isNumberOperator(operator);
    case 'generic':
      return isGenericOperator(operator);
    default:
      return assertUnreachable(groupType);
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

  switch (actionType) {
    case 'end_interview':
      return 'End interview';
    case 'do_nothing':
      return 'Do nothing';
    case 'push':
      return 'Go to stage';
    case 'skip':
    case 'checkpoint':
    case 'restore':
    case 'milestone':
      // capitalize first letter
      return actionType[0].toUpperCase() + actionType.substring(1);
    default:
      return assertUnreachable(actionType);
  }
}

export function getId(
  action: ConditionalAction | ConditionalActionCreate,
): string {
  return isCreateType(action) ? action.tempId : action.id;
}

export function doesOperatorRequireValue(
  operator: ConditionalOperator,
): boolean {
  return isNumberOperator(operator) || operator === 'eq';
}

export type { ConditionalAction as T };
export type { ConditionalActionCreate as CreateT };
export type { SerializedConditionalActionRead as SerializedT };
export type { ConditionalOperator };
export type { ActionType };
export type { ConditionGroupType };
