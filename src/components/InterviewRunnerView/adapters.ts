import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import { ScriptConfigSchema } from '../../script/ScriptConfigSchema';

// Compatibility layer between existing app types and ConfigurableScript
// types. Should eventually be deprecated perhaps?

/**
 * Attaches getter method necessary for ConfigurableScript to InterviewScreen.T type.
 */
export class InterviewScreenAdapter {
  constructor(private interviewScreen: InterviewScreen.T) {}

  getId(): string {
    return this.interviewScreen.id;
  }

  public getInterviewScreen(): InterviewScreen.T {
    return this.interviewScreen;
  }
}

// TODO: correctly build script, instead of just enqueueing every screen
export function buildScriptConfig(
  interview: Interview.WithScreensT,
): ScriptConfigSchema {
  return {
    actions: {},
    startingState: Interview.getStartingScreens(interview).map(
      screen => screen.id,
    ),
  };
}
