import invariant from 'invariant';
import { QuestionRouter, Script } from '@dataclinic/interview';
import { DateTime } from 'luxon';
import assertUnreachable from '../util/assertUnreachable';
import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import * as ConditionalAction from '../models/ConditionalAction';
import type { ResponseData } from './types';

function stringToDateTime(dateString: string): DateTime {
  const date = DateTime.fromISO(dateString);
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
  ): string {
    invariant(
      responseKey in responseData,
      `Could not find '${responseKey}' in the response data.`,
    );

    const { response } = responseData[responseKey];
    if (typeof response === 'string') {
      return response;
    }

    if (responseKeyField) {
      invariant(
        responseKeyField in response,
        `Could not find '${responseKeyField}' in the object held by '${responseKey}'`,
      );

      return String(response[responseKeyField]);
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
    if (
      !action.responseKey ||
      action.conditionalOperator ===
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

    if (!testValue || !responseValue) {
      return false;
    }

    switch (action.conditionalOperator) {
      case ConditionalAction.ConditionalOperator.EQ:
        return responseValue === testValue;
      case ConditionalAction.ConditionalOperator.GT:
        return responseValue > testValue;
      case ConditionalAction.ConditionalOperator.GTE:
        return responseValue >= testValue;
      case ConditionalAction.ConditionalOperator.LT:
        return responseValue < testValue;
      case ConditionalAction.ConditionalOperator.LTE:
        return responseValue <= testValue;

      // process datetime operators
      case ConditionalAction.ConditionalOperator.AFTER:
      case ConditionalAction.ConditionalOperator.AFTER_OR_EQUAL:
      case ConditionalAction.ConditionalOperator.BEFORE:
      case ConditionalAction.ConditionalOperator.BEFORE_OR_EQUAL:
      case ConditionalAction.ConditionalOperator.EQUALS_DATE: {
        const responseDate = stringToDateTime(responseValue);
        const testDate = stringToDateTime(testValue);

        switch (action.conditionalOperator) {
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
            return responseDate.startOf('day').equals(testDate.startOf('day'));
          default:
            assertUnreachable(action.conditionalOperator, {
              throwError: false,
            });
            return false;
        }
      }
      default:
        assertUnreachable(action.conditionalOperator, { throwError: false });
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
