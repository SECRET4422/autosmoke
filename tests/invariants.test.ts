import test from 'node:test';
import assert from 'node:assert';
import { InvariantEngine } from '../src/invariants.js';
import { RouteNode } from '../src/types.js';

test('InvariantEngine establishes baseline and flags regressions accurately', () => {
  const engine = new InvariantEngine();

  const initialPassingRoutes: RouteNode[] = [
    {
      path: '/dashboard',
      url: 'http://localhost:3000/dashboard',
      statusCode: 200,
      title: 'Dashboard',
      links: [],
      buttons: [{ tag: 'button', id: 'save-btn', text: 'Save Project', isDead: false }],
      forms: [{ tag: 'form', action: '/api/save' }],
      images: [],
      hasRuntimeError: false,
      crawlTimeMs: 12,
    },
  ];

  // Pass 1: Establish baseline
  const pass1 = engine.evaluateRoutes(initialPassingRoutes);
  assert.strictEqual(pass1.regressions.length, 0, 'Initial pass should have 0 regressions');
  assert.strictEqual(pass1.invariants.length, 3, 'Should produce 3 health invariants (route, button, form)');
  assert.ok(pass1.invariants.every((i) => i.status === 'PASS'), 'All invariants should initially PASS');

  // Pass 2: Simulate an AI edit breaking the route with a 500 error
  const brokenRoutes: RouteNode[] = [
    {
      path: '/dashboard',
      url: 'http://localhost:3000/dashboard',
      statusCode: 500,
      title: 'Server Error',
      links: [],
      buttons: [],
      forms: [],
      images: [],
      hasRuntimeError: true,
      errorMessage: 'HTTP 500 Server Error',
      crawlTimeMs: 8,
    },
  ];

  const pass2 = engine.evaluateRoutes(brokenRoutes, 'src/routes/dashboard.tsx');
  assert.strictEqual(pass2.regressions.length, 1, 'Should catch exactly 1 regression');
  
  const reg = pass2.regressions[0];
  assert.strictEqual(reg.path, '/dashboard');
  assert.strictEqual(reg.triggerFile, 'src/routes/dashboard.tsx');
  assert.ok(reg.fixPrompt.includes('REGRESSION ALERT'), 'Fix prompt should be formatted properly');
  assert.ok(reg.fixPrompt.includes('src/routes/dashboard.tsx'), 'Fix prompt should reference trigger file');
});
