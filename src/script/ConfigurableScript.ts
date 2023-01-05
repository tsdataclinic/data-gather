import { QuestionRouter, ResponseData, Script } from '@dataclinic/interview';
import assertUnreachable from '../util/assertUnreachable';
import * as Interview from '../models/Interview';
import * as InterviewScreen from '../models/InterviewScreen';
import * as ConditionalAction from '../models/ConditionalAction';

class ConfigurableScript implements Script<InterviewScreen.T> {
  // eslint-disable-next-line
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
    const responseValue = responseData[action.responseKey];
    const testValue = action.value;
    if (!testValue) {
      return false;
    }
    switch (action.conditionalOperator) {
      case ConditionalAction.ConditionalOperator.EQ:
        return responseValue === testValue;
      case ConditionalAction.ConditionalOperator.GT:
        return responseValue > testValue;
      case ConditionalAction.ConditionalOperator.AFTER:
        return responseValue > testValue;
      case ConditionalAction.ConditionalOperator.GTE:
        return responseValue >= testValue;
      case ConditionalAction.ConditionalOperator.LT:
        return responseValue < testValue;
      case ConditionalAction.ConditionalOperator.BEFORE:
        return responseValue < testValue;
      case ConditionalAction.ConditionalOperator.LTE:
        return responseValue <= testValue;
      default:
        assertUnreachable(action.conditionalOperator, { throwError: false });
    }
    return false;
  }

  private executeAction(
    action: ConditionalAction.T,
    router: QuestionRouter<InterviewScreen.T>,
  ): void {
    switch (action.actionConfig.type) {
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
