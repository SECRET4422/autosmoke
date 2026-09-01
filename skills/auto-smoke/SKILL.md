---
name: auto-smoke
description: "Zero-Code Automated Invariant & Regression Guard for Localhost dev servers. Use to automatically crawl localhost, discover routes and interactive elements, verify HTTP 200 health, and catch regressions caused by AI code edits."
category: testing
risk: safe
author: Prabhakar Pal
tags: [testing, regression, smoke-testing, localhost, vibe-coding, quality]
tools: [autosmoke, claude, cursor]
---

# AutoSmoke Agent Skill

This skill allows AI coding agents and autonomous pair-programmers to self-verify web application health against `localhost` without writing custom test scripts.

## When to Use

- After modifying frontend routes, components, buttons, or backend API handlers.
- To detect if a recent code edit caused a 500 error, React error boundary crash, or broken button on `localhost`.
- To generate a Markdown audit report of all reachable routes and interactive elements.

---

## Quick CLI Reference

```bash
# Start background regression watcher
npx @ssgk4422/autosmoke

# Run instant one-off invariant scan
npx @ssgk4422/autosmoke scan

# Generate Markdown health report (autosmoke-report.md)
npx @ssgk4422/autosmoke report

# Target specific custom port
npx @ssgk4422/autosmoke --port 8080
```

---

## Self-Verification Workflow for AI Agents

1. **Verify Dev Server**: Ensure local dev server is running on `localhost`.
2. **Execute Invariant Scan**:
   Run `npx @ssgk4422/autosmoke scan` to verify that all discovered routes return HTTP 200 and all interactive buttons remain active.
3. **Handle Regressions**:
   If an invariant fails, inspect the error output, fix the root-cause bug, and re-run the scan before presenting changes to the user.
