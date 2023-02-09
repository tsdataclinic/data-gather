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
  static getResponseValue(
    responseData: ResponseData,
    responseKey: string,
    responseKeyField?: string,
  ): string | undefined {
    if (!(responseKey in responseData)) {
      return undefined;
    }

    const { response } = responseData[responseKey];

    if (typeof response === 'string') {
      return response;
    }

    // Airtable will drop any colums from the response that have a null value
    // https://community.airtable.com/t5/development-apis/api-behavior-for-empty-fields-null-values/td-p/108285
    // It should be ok to assume that the value exists but is null here  because we enforce users selecting only
    // existing keys further up the stack
    if (responseKeyField) {
      const responseKeyReturn =
        responseKeyField in response ? response[responseKeyField] : null;

      return String(responseKeyReturn);
    }

    return JSON.stringify(response);
  }

  static getResponseValueForAction(
    responseData: ResponseData,
    action: ConditionalAction.T,
  ): string | undefined {
    const { responseKey, responseKeyField } = action;
    if (!responseKey) {
      return undefined;
    }

    return ConfigurableScript.getResponseValue(
      responseData,
      responseKey,
      responseKeyField,
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
    const potentialActions: ConditionalAction.T[] | undefined =
      this.actions.get(screen.id);
    if (!potentialActions) {
      return;
    }
    potentialActions.forEach(potentialAction => {
      if (ConfigurableScript.evaluateCondition(potentialAction, responseData)) {
        this.executeAction(potentialAction, router);
      }
    });
    router.next();
  }

  private static evaluateCondition(
    action: ConditionalAction.T,
    responseData: ResponseData,
  ): boolean {
    const { responseKey, conditionalOperator } = action;

    if (
      !responseKey ||
      conditionalOperator ===
        ConditionalAction.ConditionalOperator.ALWAYS_EXECUTE
    ) {
      return true;
    }

    // get the value we want to test against
    const testValue = action.value;

    // get the response value we want to test
    const responseValue = ConfigurableScript.getResponseValueForAction(
      responseData,
      action,
    );

    // wrapper function to require values, which we need for many conditions
    // (but some, like IS_EMPTY and IS_NOT_EMPTY work fine without a value
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
          (responseVal, testVal) => responseVal > testVal,
        );
      case ConditionalAction.ConditionalOperator.GTE:
        return withRequiredValues(
          (responseVal, testVal) => responseVal >= testVal,
        );
      case ConditionalAction.ConditionalOperator.LT:
        return withRequiredValues(
          (responseVal, testVal) => responseVal < testVal,
        );
      case ConditionalAction.ConditionalOperator.LTE:
        return withRequiredValues(
          (responseVal, testVal) => responseVal <= testVal,
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

  private executeAction(
    action: ConditionalAction.T,
    router: QuestionRouter<InterviewScreen.T>,
  ): void {
    switch (action.actionConfig.type) {
      case ConditionalAction.ActionType.END_INTERVIEW:
        router.complete();
        break;
      case ConditionalAction.ActionType.PUSH:
        this.pushInReverseOrder(action.actionConfig.payload, router);
        break;
      case ConditionalAction.ActionType.SKIP:
        router.skip(action.actionConfig.payload);
        break;
      case ConditionalAction.ActionType.CHECKPOINT:
        router.checkpoint(action.actionConfig.payload);
        break;
      case ConditionalAction.ActionType.RESTORE:
        router.restore(action.actionConfig.payload);
        break;
      case ConditionalAction.ActionType.MILESTONE:
        router.milestone(action.actionConfig.payload);
        break;
      default:
        assertUnreachable(action.actionConfig, { throwError: false });
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
