import {
  Moderator,
  ResponseData,
  ResponseConsumer,
} from '@dataclinic/interview';
import { GuessingGameQuestion } from '../GuessingGameQuestion';

export default class GuessingGameModerator
  implements Moderator<GuessingGameQuestion>
{
  public setQuestion: (q: GuessingGameQuestion) => void;
  public setResponseConsumer: (consumer: ResponseConsumer) => void;
  public setResponseData: (responseData: ResponseData) => void;

  /**
   * This Moderator's constructors takes a bunch fo React setters (from
   * useState) so that some of the moderator's internals (the question
   * being asked, the response consumer, and the response data) can be
   * accessible from a React component.
   *
   * @param setQuestion - A react setter for the question being asked
   * @param setResponseConsumer - A react setter for the ResponseConsumer
   * @param setResponseData - A react setter for the ResponseData
   */
  constructor(
    setQuestion: (q: GuessingGameQuestion) => void,
    setResponseConsumer: (consumer: ResponseConsumer) => void,
    setResponseData: (data: ResponseData) => void,
  ) {
    this.setQuestion = setQuestion;
    this.setResponseConsumer = setResponseConsumer;
    this.setResponseData = setResponseData;
  }

  public ask(
    consumer: ResponseConsumer,
    question: GuessingGameQuestion,
    responseData: ResponseData,
  ): void {
    // expose the response consumer for use by the React app
    this.setResponseConsumer(consumer);

    // set the question and response data for use by the React app to render
    // things appropriately
    this.setQuestion(question);
    this.setResponseData(responseData);
  }
}
