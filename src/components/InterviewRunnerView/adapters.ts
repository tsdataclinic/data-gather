import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import { ScriptConfigSchema } from '../../script/ScriptConfigSchema';

/**
 * Attaches getter method necessary for ConfigurableScript to InterviewScreen.T type.
 */
export class InterviewScreenAdapter {
  // eslint-disable-next-line
  constructor(private interviewScreen: InterviewScreen.T) {}

  getId(): string {
    return this.interviewScreen.id;
  }

  public getInterviewScreen(): InterviewScreen.T {
    return this.interviewScreen;
  }
}

// TODO: correctly build script, instead of just enqueueing every screen
export function buildScriptConfig(_interview: Interview.T): ScriptConfigSchema {
  return {
    actions: {},
    startingState: [..._interview.screens],
  };
}
