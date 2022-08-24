import { QuestionRouter, ResponseData, Script } from '@dataclinic/interview';
import assertUnreachable from '../util/assertUnreachable';
import {
  Condition,
  ConditionalAction,
  ScriptConfigSchema,
} from './ScriptConfigSchema';

/**
 * Script implementation which is driven by a JSON configuration. Instances of the Question type T
 * must be identifiable by a string ID, and able to be constructed by a factory function when passed
 * a valid ID.
 */
class ConfigurableScript<T extends { getId(): string }> implements Script<T> {
  /**
   * Constructor.
   *
   * @param config            The config file which will drive the Script's logic.
   * @param questionFactory   A function which can return an instance of the question type T when given
   *                          a string ID.
   */
  // eslint-disable-next-line
  constructor(
    private config: ScriptConfigSchema,
    private questionFactory: (questionId: string) => T,
  ) {}

  setup(router: QuestionRouter<T>): void {
    this.pushInReverseOrder(this.config.startingState.slice(), router);
  }

  // eslint-disable-next-line
  prepare(): void {}

  process(
    router: QuestionRouter<T>,
    question: T,
    responseData: ResponseData,
  ): void {
    const potentialActions: ConditionalAction[] =
      this.config.actions[question.getId()] || [];
    potentialActions.forEach(potentialAction => {
      if (potentialAction.condition) {
        if (!this.evaluateCondition(potentialAction.condition, responseData)) {
          return;
        }
        this.executeAction(potentialAction, router);
      } else {
        this.executeAction(potentialAction, router);
      }
    });
    router.next();
  }

  // eslint-disable-next-line
  private evaluateCondition(
    condition: Condition,
    responseData: ResponseData,
  ): boolean {
    const responseValue = responseData[condition.key];
    const testValue = condition.value;
    let result = false;
    switch (condition.operator) {
      case '=':
        result = responseValue === testValue;
        break;
      case '!=':
        result = responseValue !== testValue;
        break;
      case '>':
        result = responseValue > testValue;
        break;
      case '<':
        result = responseValue < testValue;
        break;
      case '>=':
        result = responseValue >= testValue;
        break;
      case '<=':
        result = responseValue <= testValue;
        break;
      default:
        assertUnreachable(condition.operator, { throwError: false });
    }
    return result;
  }

  private executeAction(
    action: ConditionalAction,
    router: QuestionRouter<T>,
  ): void {
    switch (action.action) {
      case 'push':
        this.pushInReverseOrder(action.target, router);
        break;
      case 'skip':
        router.skip(action.target);
        break;
      case 'checkpoint':
        router.checkpoint(action.target);
        break;
      case 'restore':
        router.restore(action.target);
        break;
      case 'milestone':
        router.milestone(action.target);
        break;
      default:
        assertUnreachable(action, { throwError: false });
    }
  }

  private pushInReverseOrder(
    questionIds: string[],
    router: QuestionRouter<T>,
  ): void {
    questionIds
      .reverse()
      .forEach(questionId => router.push(this.questionFactory(questionId)));
  }
}

export default ConfigurableScript;
