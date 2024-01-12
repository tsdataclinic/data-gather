import { QuestionRouter, Script } from '@dataclinic/interview';
import { DateTime } from 'luxon';
import assertUnreachable from '../util/assertUnreachable';
import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import * as ConditionalAction from '../models/ConditionalAction';
import type { ResponseData } from './types';

function stringToDateTime(dateString: string): DateTime {
  // If the date is null, set date to start of epoch time
  // TODO: maybe make this externally configurable in case users  have really old dates in data
  const date =
    dateString === 'null'
      ? DateTime.fromISO(process.env.NULL_DATE_OVERRIDE || '1970-01-01')
      : DateTime.fromISO(dateString);
  if (!date.isValid) {
    throw new Error(`The date '${dateString}' failed to parse.`);
  }
  return date;
}

class ConfigurableScript implements Script<InterviewScreen.T> {
  /**
   * Given a `responseKey` and an optional lookup field,
   * `responseKeyLookupField`, extract that response's value from the
   * `responseData`.
   */
  static getResponseValue(
    responseData: ResponseData,
    responseKey: string,
    responseKeyLookupField?: string,
  ): string | undefined {
    if (!(responseKey in responseData)) {
      return undefined;
    }

    const { response } = responseData[responseKey];

    if (typeof response === 'string') {
      return response;
    }

    // Airtable will drop any column from the response that have a null value
    // https://community.airtable.com/t5/development-apis/api-behavior-for-empty-fields-null-values/td-p/108285
    // It should be ok to assume that the value exists but is null here because
    // we enforce users selecting only existing keys further up the stack
    if (responseKeyLookupField) {
      const responseKeyReturn =
        responseKeyLookupField in response
          ? response[responseKeyLookupField]
          : null;

      return String(responseKeyReturn);
    }

    return JSON.stringify(response);
  }

  static getResponseValueForSingleCondition(
    responseData: ResponseData,
    singleCondition: ConditionalAction.SingleCondition,
  ): string | undefined {
    const { responseKey, responseKeyLookupField } = singleCondition;
    if (!responseKey) {
      return undefined;
    }

    return ConfigurableScript.getResponseValue(
      responseData,
      responseKey,
      responseKeyLookupField,
    );
  }

  constructor(
    private interview: Interview.WithScreensAndActions,
    private actions: ReadonlyMap<string, ConditionalAction.T[]>,
    private screens: ReadonlyMap<string, InterviewScreen.WithChildrenT>,
  ) {}

  setup(router: QuestionRouter<InterviewScreen.T>): void {
    this.pushInReverseOrder(
      Interview.getStartingScreens(this.interview).map(screen => screen.id),
      router,
    );
  }

  // eslint-disable-next-line
  prepare(): void {}

  process(
    router: QuestionRouter<InterviewScreen.T>,
    screen: InterviewScreen.T,
    responseData: ResponseData,
  ): void {
    const conditionalActions: ConditionalAction.T[] | undefined =
      this.actions.get(screen.id);
    if (!conditionalActions) {
      return;
    }

    // for each conditional action, evaluate the condition and get the action
    // that needs to be taken
    const actionsToExecute = conditionalActions.map(conditionalAction =>
      ConfigurableScript.evaluateIfClause(
        conditionalAction.ifClause,
        responseData,
      ),
    );

    // now execute each action
    actionsToExecute.forEach(actionConfig => {
      this.executeAction(actionConfig, router);
    });

    router.next();
  }

  /**
   * Evaluate a single condition with a `ResponseData` object and return if
   * this condition passes or not.
   */
  static evaluateSingleCondition(
    singleCondition: ConditionalAction.SingleCondition,
    responseData: ResponseData,
  ): boolean {
    const {
      responseKey,
      conditionalOperator,
      value: testValue,
    } = singleCondition;

    if (
      !responseKey ||
      conditionalOperator ===
        ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE
    ) {
      return true;
    }

    // get the response value we want to test
    const responseValue = ConfigurableScript.getResponseValueForSingleCondition(
      responseData,
      singleCondition,
    );

    // wrapper function to check for require values, which we need for many
    // conditions (but some, like IS_EMPTY and IS_NOT_EMPTY work fine without
    // a value
    const withRequiredValues = (
      predicate: (responseVal: string, testVal: string) => boolean,
    ): boolean => {
      if (!testValue || !responseValue) {
        return false;
      }
      return predicate(responseValue, testValue);
    };

    switch (conditionalOperator) {
      case ConditionalAction.ConditionalOperator.EQ:
        return responseValue === testValue;
      case ConditionalAction.ConditionalOperator.GT:
        return withRequiredValues(
          (responseVal, testVal) => Number(responseVal) > Number(testVal),
        );
      case ConditionalAction.ConditionalOperator.GTE:
        return withRequiredValues(
          (responseVal, testVal) => Number(responseVal) >= Number(testVal),
        );
      case ConditionalAction.ConditionalOperator.LT:
        return withRequiredValues(
          (responseVal, testVal) => Number(responseVal) < Number(testVal),
        );
      case ConditionalAction.ConditionalOperator.LTE:
        return withRequiredValues(
          (responseVal, testVal) => Number(responseVal) <= Number(testVal),
        );
      case ConditionalAction.ConditionalOperator.IS_EMPTY:
        return (
          responseValue === undefined ||
          responseValue === null ||
          responseValue === '' ||
          responseValue === 'null'
        );
      case ConditionalAction.ConditionalOperator.IS_NOT_EMPTY:
        return (
          responseValue !== undefined &&
          responseValue !== null &&
          responseValue !== '' &&
          responseValue !== 'null'
        );

      // process datetime operators
      case ConditionalAction.ConditionalOperator.AFTER:
      case ConditionalAction.ConditionalOperator.AFTER_OR_EQUAL:
      case ConditionalAction.ConditionalOperator.BEFORE:
      case ConditionalAction.ConditionalOperator.BEFORE_OR_EQUAL:
      case ConditionalAction.ConditionalOperator.EQUALS_DATE:
        return withRequiredValues((responseVal, testVal) => {
          const responseDate = stringToDateTime(responseVal);
          const testDate = stringToDateTime(testVal);

          switch (conditionalOperator) {
            case ConditionalAction.ConditionalOperator.AFTER:
              return responseDate > testDate;
            case ConditionalAction.ConditionalOperator.AFTER_OR_EQUAL:
              return responseDate >= testDate;
            case ConditionalAction.ConditionalOperator.BEFORE:
              return responseDate < testDate;
            case ConditionalAction.ConditionalOperator.BEFORE_OR_EQUAL:
              return responseDate <= testDate;
            case ConditionalAction.ConditionalOperator.EQUALS_DATE:
              // we will count two dates as equal if they occur on the same day
              return responseDate
                .startOf('day')
                .equals(testDate.startOf('day'));
            default:
              assertUnreachable(conditionalOperator, {
                throwError: false,
              });
              return false;
          }
        });
      default:
        assertUnreachable(conditionalOperator, { throwError: false });
        return false;
    }
  }

  private static evaluateSingleConditionOrGroup(
    condition:
      | ConditionalAction.SingleCondition
      | ConditionalAction.ConditionGroup,
    responseData: ResponseData,
  ): boolean {
    return ConditionalAction.isSingleCondition(condition)
      ? ConfigurableScript.evaluateSingleCondition(condition, responseData)
      : ConfigurableScript.evaluateConditionGroup(condition, responseData);
  }

  /**
   * Evaluate a ConditionGroup, which can recursively consist of other
   * SingleCondition or ConditionGroup objects. Each condition group can be
   * of type 'and' or 'or' which determines if we need all conditions, or at
   * least one condition, to pass.
   */
  static evaluateConditionGroup(
    conditionGroup: ConditionalAction.ConditionGroup,
    responseData: ResponseData,
  ): boolean {
    const { conditions, type } = conditionGroup;

    switch (type) {
      case ConditionalAction.ConditionGroupType.AND:
        return conditions.every(condition =>
          ConfigurableScript.evaluateSingleConditionOrGroup(
            condition,
            responseData,
          ),
        );
      case ConditionalAction.ConditionGroupType.OR:
        return conditions.some(condition =>
          ConfigurableScript.evaluateSingleConditionOrGroup(
            condition,
            responseData,
          ),
        );
      default:
        assertUnreachable(type, { throwError: false });
        return false;
    }
  }

  /**
   * Evaluate an IfClause and return the action that needs to be taken.
   * This involves recursively evaluating the if/else conditions.
   *
   * This function doesn't return true/false because even if a condition
   * evaluates to `false` this would mean we'd want to return the action from
   * the 'else' clause.
   */
  static evaluateIfClause(
    ifClause: ConditionalAction.IfClause,
    responseData: ResponseData,
  ): ConditionalAction.ActionConfig {
    const { action, conditionGroup, elseClause } = ifClause;
    if (
      ConfigurableScript.evaluateConditionGroup(conditionGroup, responseData)
    ) {
      return action;
    }
    if (ConditionalAction.isIfClause(elseClause)) {
      return ConfigurableScript.evaluateIfClause(elseClause, responseData);
    }
    return elseClause;
  }

  private executeAction(
    actionConfig: ConditionalAction.ActionConfig,
    router: QuestionRouter<InterviewScreen.T>,
  ): void {
    switch (actionConfig.type) {
      case ConditionalAction.ActionType.END_INTERVIEW:
        router.complete();
        break;
      case ConditionalAction.ActionType.DO_NOTHING:
        break;
      case ConditionalAction.ActionType.PUSH:
        this.pushInReverseOrder(actionConfig.payload, router);
        break;
      case ConditionalAction.ActionType.SKIP:
        router.skip(actionConfig.payload);
        break;
      case ConditionalAction.ActionType.CHECKPOINT:
        router.checkpoint(actionConfig.payload);
        break;
      case ConditionalAction.ActionType.RESTORE:
        router.restore(actionConfig.payload);
        break;
      case ConditionalAction.ActionType.MILESTONE:
        router.milestone(actionConfig.payload);
        break;
      default:
        assertUnreachable(actionConfig, {
          throwError: false,
        });
    }
  }

  private pushInReverseOrder(
    questionIds: readonly string[],
    router: QuestionRouter<InterviewScreen.T>,
  ): void {
    questionIds
      .slice()
      .reverse()
      .forEach(questionId => {
        const screen: InterviewScreen.T | undefined =
          this.screens.get(questionId);
        if (screen) {
          router.push(screen);
        }
      });
  }
}

export default ConfigurableScript;
