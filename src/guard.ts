import fs from 'node:fs';
import path from 'node:path';
import { LocalhostDetector } from './detector.js';
import { AppCrawler } from './crawler.js';
import { InvariantEngine } from './invariants.js';
import { TerminalUI } from './ui.js';
import { DiscoveredServer, SmokeReport } from './types.js';

export class SmokeGuard {
  private targetDir: string;
  private customPort?: number;
  private engine = new InvariantEngine();
  private debounceTimer: NodeJS.Timeout | null = null;
  private server: DiscoveredServer | null = null;

  constructor(targetDir: string = process.cwd(), customPort?: number) {
    this.targetDir = targetDir;
    this.customPort = customPort;
  }

  public async start(): Promise<void> {
    TerminalUI.printBanner();

    this.server = await LocalhostDetector.scan(this.customPort);
    if (!this.server) {
      console.log('⚠️  No active localhost dev server found on common ports (3000, 5173, 8080, 8000).');
      console.log('💡 Start your dev server (e.g. `npm run dev`) and re-run `npx @ssgk4422/autosmoke`.\n');
      process.exit(1);
    }

    TerminalUI.printDiscovered(this.server.url, this.server.framework);

    // Initial baseline pass
    console.log('🔍 Establishing initial invariant baseline...');
    const initialReport = await this.runSmokePass();
    TerminalUI.printInvariantsSummary(initialReport);

    console.log('🛡️  SmokeGuard active. Watching for code changes...\n');
    this.watchDirectory();
  }

  public async runSmokePass(triggerFile?: string): Promise<SmokeReport> {
    const startTime = Date.now();
    if (!this.server) {
      throw new Error('No server connected');
    }

    const crawler = new AppCrawler(this.server.url);
    const routes = await crawler.crawl();
    const { invariants, regressions } = this.engine.evaluateRoutes(routes, triggerFile);

    const passedCount = invariants.filter((i) => i.status === 'PASS').length;
    const failedCount = invariants.filter((i) => i.status === 'FAIL').length;

    return {
      baseUrl: this.server.url,
      port: this.server.port,
      framework: this.server.framework,
      totalRoutes: routes.length,
      totalInvariants: invariants.length,
      passedCount,
      failedCount,
      invariants,
      regressions,
      durationMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private watchDirectory(): void {
    const ignored = ['node_modules', '.git', 'build', 'dist', '.autosmoke', '.next', '.cache'];

    fs.watch(this.targetDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const norm = filename.replace(/\\/g, '/');
      if (ignored.some((dir) => norm.startsWith(dir) || norm.includes(`/${dir}/`))) {
        return;
      }

      const validExts = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.html', '.css'];
      if (!validExts.some((ext) => norm.endsWith(ext))) {
        return;
      }

      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(async () => {
        try {
          const report = await this.runSmokePass(norm);
          if (report.regressions.length > 0) {
            for (const regression of report.regressions) {
              TerminalUI.printRegressionAlert(regression);
            }
          } else {
            console.log(`[${new Date().toLocaleTimeString()}] ✔ Edit to '${norm}' passed all ${report.totalInvariants} invariants (${report.durationMs}ms)`);
          }
        } catch {
          // Dev server might be mid-recompile
        }
      }, 600);
    });
  }
}
