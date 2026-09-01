import { SmokeReport, HealthInvariant, RegressionAlert } from './types.js';

export class TerminalUI {
  private static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    white: '\x1b[37m',
  };

  public static printBanner(): void {
    const { cyan, magenta, bright, reset, dim, white } = this.colors;
    console.log(
      `\n${cyan}╔═══════════════════════════════════════════════════════════════╗${reset}`
    );
    console.log(
      `${cyan}║${bright}${magenta}                 💨 AutoSmoke v1.0.0                          ${cyan}║${reset}`
    );
    console.log(
      `${cyan}║${bright}${white}    Zero-Code Automated Invariant & Regression Guard           ${cyan}║${reset}`
    );
    console.log(
      `${cyan}╚═══════════════════════════════════════════════════════════════╝${reset}`
    );
    console.log(
      `${dim}  Monitoring localhost dev server & auto-verifying invariants...${reset}\n`
    );
  }

  public static printDiscovered(url: string, framework: string): void {
    const { green, bright, reset, cyan } = this.colors;
    console.log(
      `🎯 ${bright}Connected to Localhost:${reset} ${cyan}${url}${reset} (${green}${framework}${reset})\n`
    );
  }

  public static printInvariantsSummary(report: SmokeReport): void {
    const { green, red, yellow, bright, reset, dim } = this.colors;

    console.log(`${bright}📊 Invariant Health Check Results:${reset}`);
    console.log(`   Discovered Routes: ${bright}${report.totalRoutes}${reset}`);
    console.log(
      `   Invariants Verified: ${bright}${report.totalInvariants}${reset} (` +
      `${green}✔ ${report.passedCount} Passed${reset}, ` +
      `${report.failedCount > 0 ? `${red}✖ ${report.failedCount} Failed${reset}` : `${green}0 Failed${reset}`})`
    );
    console.log(`   Verification Time: ${dim}${report.durationMs}ms${reset}\n`);

    console.log(`${dim}┌──────────────────────────┬──────────────────────┬─────────┐${reset}`);
    console.log(`${dim}│${reset} ${bright}Route / Element${reset}          ${dim}│${reset} ${bright}Invariant Expected${reset}   ${dim}│${reset} ${bright}Status${reset}  ${dim}│${reset}`);
    console.log(`${dim}├──────────────────────────┼──────────────────────┼─────────┤${reset}`);

    for (const inv of report.invariants.slice(0, 15)) {
      const targetStr = (inv.path + ' ' + inv.target).slice(0, 24).padEnd(24);
      const expStr = inv.expected.slice(0, 20).padEnd(20);
      const statusBadge =
        inv.status === 'PASS'
          ? `${green}  PASS ${reset}`
          : `${red}  FAIL ${reset}`;

      console.log(`${dim}│${reset} ${targetStr} ${dim}│${reset} ${expStr} ${dim}│${reset}${statusBadge}${dim}│${reset}`);
    }

    if (report.invariants.length > 15) {
      console.log(`${dim}│  ... and ${report.invariants.length - 15} more invariants verified                     │${reset}`);
    }
    console.log(`${dim}└──────────────────────────┴──────────────────────┴─────────┘${reset}\n`);
  }

  public static printRegressionAlert(regression: RegressionAlert): void {
    const { red, bgRed, yellow, bright, reset, white, dim } = this.colors;

    console.log(`\n${bgRed}${white}${bright} 🚨 REGRESSION DETECTED ${reset}\n`);
    console.log(`${bright}Route:${reset} ${yellow}${regression.path}${reset}`);
    console.log(`${bright}Target:${reset} ${regression.target}`);
    console.log(`${bright}What Happened:${reset} ${red}${regression.description}${reset}`);
    if (regression.triggerFile) {
      console.log(`${bright}Triggered By:${reset} Edit to ${yellow}${regression.triggerFile}${reset}`);
    }
    console.log(`\n${bright}👉 Paste this fix prompt into Cursor / Claude to repair:${reset}`);
    console.log(`${dim}---------------------------------------------------------------${reset}`);
    console.log(`${yellow}${regression.fixPrompt}${reset}`);
    console.log(`${dim}---------------------------------------------------------------${reset}\n`);
  }

  public static generateMarkdownReport(report: SmokeReport): string {
    return `# 💨 AutoSmoke Health & Invariant Report

**Target:** ${report.baseUrl} (${report.framework})  
**Generated:** ${new Date(report.timestamp).toISOString()}  
**Duration:** ${report.durationMs}ms  

---

## 📊 Summary
- **Total Routes Crawled:** ${report.totalRoutes}
- **Total Invariants:** ${report.totalInvariants}
- **Passed:** ${report.passedCount}
- **Failed:** ${report.failedCount}
- **Active Regressions:** ${report.regressions.length}

---

## 🔍 Invariant Matrix

| Route | Target | Expected | Status | Details |
|---|---|---|---|---|
${report.invariants
  .map(
    (inv) =>
      `| \`${inv.path}\` | \`${inv.target}\` | ${inv.expected} | ${inv.status === 'PASS' ? '🟢 PASS' : '🔴 FAIL'} | ${inv.errorDetails || 'OK'} |`
  )
  .join('\n')}

---

*Report generated by [@ssgk4422/autosmoke](https://github.com/SECRET4422/autosmoke)*
`;
  }
}
