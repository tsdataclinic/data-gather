import { QuestionRouter, Script, ResponseData } from '@dataclinic/interview';
import { GuessingGameQuestion } from '../GuessingGameQuestion';

export default class GuessingGameScript
  implements Script<GuessingGameQuestion>
{
  private correctAnswer: number = 7;

  setup(router: QuestionRouter<GuessingGameQuestion>) {
    router.push(GuessingGameQuestion.GUESS);
    router.push(GuessingGameQuestion.NAME);
  }

  process(
    router: QuestionRouter<GuessingGameQuestion>,
    question: GuessingGameQuestion,
    data: ResponseData,
  ): void {
    switch (question) {
      case GuessingGameQuestion.GUESS:
      case GuessingGameQuestion.INCORRECT_GUESS: {
        if (data.numbersGuessed[0] === this.correctAnswer) {
          router.push(GuessingGameQuestion.CORRECT_ENDING);
        } else {
          router.push(GuessingGameQuestion.INCORRECT_GUESS);
        }
        return router.next();
      }
      case GuessingGameQuestion.CORRECT_ENDING:
        return router.complete();
      default:
        return router.next();
    }
  }

  // TODO: this should not be required to override when implementing Script<>
  prepare(): void {
    return;
  }
}
