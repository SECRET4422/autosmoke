import { HealthInvariant } from './types.js';

export class PromptGenerator {
  public static generateRegressionFixPrompt(
    invariant: HealthInvariant,
    triggerFile?: string
  ): string {
    const fileHint = triggerFile ? ` triggered after recent changes to '${triggerFile}'` : '';

    if (invariant.type === 'ROUTE_HEALTH') {
      return `REGRESSION ALERT: The latest code change broke the route '${invariant.path}'${fileHint}.
Current failure: ${invariant.actual}.
Expected behavior: ${invariant.expected}.

Please inspect the recent modifications, identify why '${invariant.path}' is failing, and restore the route to a working state without reverting adjacent features.`;
    }

    if (invariant.type === 'BUTTON_INTERACTION') {
      return `REGRESSION ALERT: On route '${invariant.path}', the element ${invariant.target} was disabled or broken${fileHint}.
Failure details: ${invariant.actual}.

Please restore the interactive handler and ensure the component renders cleanly with proper event binding.`;
    }

    return `REGRESSION ALERT: Invariant failure on route '${invariant.path}' for ${invariant.target}${fileHint}.
Observed state: ${invariant.actual} (Expected: ${invariant.expected}).

Please fix the underlying regression in the code.`;
  }
}
