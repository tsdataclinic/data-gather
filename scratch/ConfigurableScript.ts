import { readFileSync } from 'fs';
import { QuestionRouter, ResponseData, Script } from '@dataclinic/interview';
import {
  Condition,
  ConditionalAction,
  ScriptConfigSchema,
} from './ScriptConfigSchema';
import StringIdQuestion from './StringIdQuestion';

class ConfigurableScript implements Script<StringIdQuestion> {
  private config: ScriptConfigSchema;

  constructor(configFilename: string) {
    this.config = JSON.parse(readFileSync(configFilename).toString('utf8'));
  }

  setup(router: QuestionRouter<StringIdQuestion>): void {
    this.pushInReverseOrder(this.config.startingState.slice(), router);
  }

  prepare(
    router: QuestionRouter<StringIdQuestion>,
    question: StringIdQuestion,
    responseData: ResponseData,
  ): void {}

  process(
    router: QuestionRouter<StringIdQuestion>,
    question: StringIdQuestion,
    responseData: ResponseData,
  ): void {
    const potentialActions: ConditionalAction[] =
      this.config.actions[question.getId()] || [];
    for (const potentialAction of potentialActions) {
      if (potentialAction.condition) {
        if (!this.evaluateCondition(potentialAction.condition, responseData)) {
          continue;
        }
        this.executeAction(potentialAction, router);
      }
    }
    router.next();
  }

  private evaluateCondition(
    condition: Condition,
    responseData: ResponseData,
  ): boolean {
    if (condition.operator !== '=') {
      throw new Error('Only equality operator has been implemented');
    }
    return responseData[condition.key] === condition.value;
  }

  private executeAction(
    action: ConditionalAction,
    router: QuestionRouter<StringIdQuestion>,
  ) {
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
    }
  }

  private pushInReverseOrder(
    questionIds: string[],
    router: QuestionRouter<StringIdQuestion>,
  ) {
    questionIds
      .reverse()
      .forEach(questionId => router.push(new StringIdQuestion(questionId)));
  }
}

export default ConfigurableScript;
