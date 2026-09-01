export type InvariantType =
  | 'ROUTE_HEALTH'
  | 'BUTTON_INTERACTION'
  | 'FORM_ACTION'
  | 'NO_RUNTIME_CRASH'
  | 'ASSET_INTEGRITY';

export interface DOMElement {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  action?: string;
  href?: string;
  isDead?: boolean;
}

export interface RouteNode {
  path: string;
  url: string;
  statusCode: number;
  title: string;
  links: string[];
  buttons: DOMElement[];
  forms: DOMElement[];
  images: string[];
  hasRuntimeError: boolean;
  errorMessage?: string;
  crawlTimeMs: number;
}

export interface HealthInvariant {
  id: string;
  type: InvariantType;
  path: string;
  target: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  errorDetails?: string;
}

export interface RegressionAlert {
  invariantId: string;
  type: InvariantType;
  path: string;
  target: string;
  description: string;
  previousState: string;
  currentState: string;
  triggerFile?: string;
  fixPrompt: string;
  timestamp: number;
}

export interface SmokeReport {
  baseUrl: string;
  port: number;
  framework: string;
  totalRoutes: number;
  totalInvariants: number;
  passedCount: number;
  failedCount: number;
  invariants: HealthInvariant[];
  regressions: RegressionAlert[];
  durationMs: number;
  timestamp: number;
}

export interface DiscoveredServer {
  port: number;
  url: string;
  framework: string;
}
