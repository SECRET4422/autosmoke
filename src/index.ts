#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SmokeGuard } from './guard.js';
import { LocalhostDetector } from './detector.js';
import { AppCrawler } from './crawler.js';
import { InvariantEngine } from './invariants.js';
import { TerminalUI } from './ui.js';

const args = process.argv.slice(2);

function printHelp(): void {
  TerminalUI.printBanner();
  console.log(`Usage:
  npx @ssgk4422/autosmoke               Start live background regression guard (default)
  npx @ssgk4422/autosmoke scan          Run a one-off instant invariant audit of localhost
  npx @ssgk4422/autosmoke report        Run audit and export 'autosmoke-report.md'
  npx @ssgk4422/autosmoke --port 3000   Target a specific custom localhost port
  npx @ssgk4422/autosmoke --version     Show version number

Options:
  --port, -p <number>           Specify custom dev server port
  --help, -h                    Show this help message
  --version, -v                 Show version number

Repository: https://github.com/SECRET4422/autosmoke
`);
}

async function main(): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('1.0.0');
    return;
  }

  let customPort: number | undefined;
  const portIdx = args.findIndex((a) => a === '--port' || a === '-p');
  if (portIdx !== -1 && args[portIdx + 1]) {
    customPort = parseInt(args[portIdx + 1], 10);
  }

  const command = args[0] || 'watch';

  if (command === 'scan') {
    TerminalUI.printBanner();
    const server = await LocalhostDetector.scan(customPort);
    if (!server) {
      console.log('⚠️  No active localhost dev server found.');
      process.exit(1);
    }
    TerminalUI.printDiscovered(server.url, server.framework);
    const crawler = new AppCrawler(server.url);
    const routes = await crawler.crawl();
    const engine = new InvariantEngine();
    const { invariants } = engine.evaluateRoutes(routes);

    const report = {
      baseUrl: server.url,
      port: server.port,
      framework: server.framework,
      totalRoutes: routes.length,
      totalInvariants: invariants.length,
      passedCount: invariants.filter((i) => i.status === 'PASS').length,
      failedCount: invariants.filter((i) => i.status === 'FAIL').length,
      invariants,
      regressions: [],
      durationMs: 0,
      timestamp: Date.now(),
    };

    TerminalUI.printInvariantsSummary(report);
    return;
  }

  if (command === 'report') {
    TerminalUI.printBanner();
    const server = await LocalhostDetector.scan(customPort);
    if (!server) {
      console.log('⚠️  No active localhost dev server found.');
      process.exit(1);
    }
    TerminalUI.printDiscovered(server.url, server.framework);
    console.log('🔍 Running full invariant audit and generating report...');
    const crawler = new AppCrawler(server.url);
    const routes = await crawler.crawl();
    const engine = new InvariantEngine();
    const { invariants } = engine.evaluateRoutes(routes);

    const report = {
      baseUrl: server.url,
      port: server.port,
      framework: server.framework,
      totalRoutes: routes.length,
      totalInvariants: invariants.length,
      passedCount: invariants.filter((i) => i.status === 'PASS').length,
      failedCount: invariants.filter((i) => i.status === 'FAIL').length,
      invariants,
      regressions: [],
      durationMs: 0,
      timestamp: Date.now(),
    };

    TerminalUI.printInvariantsSummary(report);
    const md = TerminalUI.generateMarkdownReport(report);
    const outPath = path.join(process.cwd(), 'autosmoke-report.md');
    fs.writeFileSync(outPath, md, 'utf8');
    console.log(`📄 Markdown report saved to: ${outPath}\n`);
    return;
  }

  // Default: start background guard
  const guard = new SmokeGuard(process.cwd(), customPort);
  await guard.start();
}

main().catch((err) => {
  console.error('Fatal AutoSmoke Error:', err);
  process.exit(1);
});
