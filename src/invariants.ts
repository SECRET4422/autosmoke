import { RouteNode, HealthInvariant, RegressionAlert } from './types.js';
import { PromptGenerator } from './prompt-generator.js';

export class InvariantEngine {
  private baseline = new Map<string, HealthInvariant>();

  public evaluateRoutes(routes: RouteNode[], triggerFile?: string): {
    invariants: HealthInvariant[];
    regressions: RegressionAlert[];
  } {
    const currentInvariants: HealthInvariant[] = [];
    const regressions: RegressionAlert[] = [];

    for (const route of routes) {
      // 1. Route Health Invariant
      const routeInvId = `route:${route.path}`;
      const routePass = route.statusCode >= 200 && route.statusCode < 400 && !route.hasRuntimeError;
      const routeInv: HealthInvariant = {
        id: routeInvId,
        type: 'ROUTE_HEALTH',
        path: route.path,
        target: route.path,
        expected: 'HTTP 200 OK (Clean Render)',
        actual: route.hasRuntimeError
          ? `CRASH: ${route.errorMessage}`
          : `HTTP ${route.statusCode} OK`,
        status: routePass ? 'PASS' : 'FAIL',
        errorDetails: route.errorMessage,
      };
      currentInvariants.push(routeInv);

      // 2. Button Interaction Invariants
      for (const btn of route.buttons) {
        const btnId = `btn:${route.path}:${btn.id || btn.className || btn.text}`;
        const btnPass = !btn.isDead;
        const btnInv: HealthInvariant = {
          id: btnId,
          type: 'BUTTON_INTERACTION',
          path: route.path,
          target: `<button> "${btn.text}"`,
          expected: 'Interactive button with valid text and enabled state',
          actual: btn.isDead ? 'Disabled or empty button' : 'Active and enabled',
          status: btnPass ? 'PASS' : 'FAIL',
          errorDetails: btn.isDead ? 'Button has no label or is disabled' : undefined,
        };
        currentInvariants.push(btnInv);
      }

      // 3. Form Invariants
      for (const form of route.forms) {
        const formId = `form:${route.path}:${form.id || form.action}`;
        const formPass = Boolean(form.action && form.action !== '');
        const formInv: HealthInvariant = {
          id: formId,
          type: 'FORM_ACTION',
          path: route.path,
          target: `<form action="${form.action}">`,
          expected: 'Form with defined submission target',
          actual: formPass ? `Action: ${form.action}` : 'Missing form action',
          status: formPass ? 'PASS' : 'FAIL',
        };
        currentInvariants.push(formInv);
      }
    }

    // Check for regressions against baseline
    for (const current of currentInvariants) {
      const prev = this.baseline.get(current.id);
      if (prev && prev.status === 'PASS' && current.status === 'FAIL') {
        const fixPrompt = PromptGenerator.generateRegressionFixPrompt(current, triggerFile);
        regressions.push({
          invariantId: current.id,
          type: current.type,
          path: current.path,
          target: current.target,
          description: `Regression on ${current.path}: ${current.target} broke (was: ${prev.actual}, now: ${current.actual})`,
          previousState: prev.actual,
          currentState: current.actual,
          triggerFile,
          fixPrompt,
          timestamp: Date.now(),
        });
      }

      // Update baseline with latest state
      this.baseline.set(current.id, current);
    }

    return { invariants: currentInvariants, regressions };
  }

  public getBaselineCount(): number {
    return this.baseline.size;
  }

  public clearBaseline(): void {
    this.baseline.clear();
  }
}
