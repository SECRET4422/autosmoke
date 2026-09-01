<h1 align="center">💨 AutoSmoke</h1>
<p align="center"><b>Zero-Code Automated Invariant & Regression Guard for Localhost dev servers.</b></p>

<p align="center">
  <a href="https://github.com/SECRET4422/autosmoke/actions"><img src="https://img.shields.io/github/actions/workflow/status/SECRET4422/autosmoke/ci.yml?branch=main&label=CI&logo=github" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@ssgk4422/autosmoke"><img src="https://img.shields.io/npm/v/@ssgk4422/autosmoke?logo=npm&color=red" alt="npm" /></a>
  <a href="https://www.npmjs.com/package/@ssgk4422/autosmoke"><img src="https://img.shields.io/npm/dm/@ssgk4422/autosmoke?logo=npm" alt="downloads" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-3ddc97.svg" alt="MIT" /></a>
  <a href="https://github.com/SECRET4422/autosmoke/stargazers"><img src="https://img.shields.io/github/stars/SECRET4422/autosmoke?style=flat&logo=github" alt="stars" /></a>
  <a href="skills/auto-smoke/SKILL.md"><img src="https://img.shields.io/badge/Agent%20Skill-Compatible-8a2be2" alt="Agent Skill" /></a>
  <img src="https://img.shields.io/badge/Zero%20API%20Keys-Free-2ea44f" alt="Zero API Keys" />
</p>

---

### The Problem: Silent AI Code Regressions

When non-technical builders and vibe-coders build web applications with AI (Cursor, Claude Code, ChatGPT):
1. They **do not write Playwright, Cypress, or Jest tests**.
2. They ask the AI to implement a new feature (e.g., *"add a filter dropdown"*).
3. The AI edits the code, but **silently breaks the `/login` route, renders a white screen React crash, or disables the checkout button**.
4. The creator doesn't notice until hours later after writing hundreds of lines on top of broken code.

**AutoSmoke catches regressions the exact second they happen.**

---

### ⚡ Quickstart

Run a single command in your terminal while your local dev server (`npm run dev`) is running:

```bash
npx @ssgk4422/autosmoke
```

> **Zero config, zero test scripts, and zero API keys required.** AutoSmoke automatically discovers your localhost server and guards your routes in the background.

---

### 🛠️ How It Works

```
╔═══════════════════════════════════════════════════════════════╗
║                 💨 AutoSmoke v1.0.0                          ║
║    Zero-Code Automated Invariant & Regression Guard           ║
╚═══════════════════════════════════════════════════════════════╝
  Monitoring localhost dev server & auto-verifying invariants...

🎯 Connected to Localhost: http://localhost:5173 (Vite / React)

📊 Invariant Health Check Results:
   Discovered Routes: 4
   Invariants Verified: 12 (✔ 12 Passed, 0 Failed)
   Verification Time: 34ms

┌──────────────────────────┬──────────────────────┬─────────┐
│ Route / Element          │ Invariant Expected   │ Status  │
├──────────────────────────┼──────────────────────┼─────────┤
│ /                        │ HTTP 200 OK (Clean)  │  PASS   │
│ / <button> "Sign In"     │ Interactive button   │  PASS   │
│ /pricing                 │ HTTP 200 OK (Clean)  │  PASS   │
│ /pricing <button> "Buy"  │ Interactive button   │  PASS   │
│ /dashboard               │ HTTP 200 OK (Clean)  │  PASS   │
└──────────────────────────┴──────────────────────┴─────────┘

🛡️  SmokeGuard active. Watching for code changes...
```

---

### 🚨 Live Regression Alarm & Instant AI Fix Prompt

When an AI prompt breaks a previously working page, AutoSmoke triggers a visual alarm:

```
=================================================================
 🚨 REGRESSION DETECTED 
=================================================================

Route: /dashboard
Target: <button> "Save Settings"
What Happened: Button became disabled/unclickable after editing src/Settings.tsx

👉 Paste this fix prompt into Cursor / Claude to repair:
---------------------------------------------------------------
REGRESSION ALERT: On route '/dashboard', the element <button> "Save Settings"
was disabled or broken triggered after recent changes to 'src/Settings.tsx'.
Failure details: Button has no label or is disabled.

Please restore the interactive handler and ensure the component
renders cleanly with proper event binding.
---------------------------------------------------------------
```

---

### 🧠 Automated Health Invariant Suite

| Invariant Type | Verification Check | Failure Trigger |
|---|---|---|
| **Route Health** | Crawls all reachable routes | HTTP 404, 500, or React Error Overlay crash |
| **Interactive Elements** | Verifies buttons & actions | Dead buttons, empty handlers, disabled states |
| **Form Integrity** | Validates form actions & targets | Missing submission targets or unbound inputs |
| **Runtime Exceptions** | Inspects DOM error boundaries | Uncaught JavaScript runtime exceptions |

---

### ⌨️ CLI Commands

```bash
# Start background live regression guard (default)
npx @ssgk4422/autosmoke

# Run instant one-off invariant audit
npx @ssgk4422/autosmoke scan

# Generate Markdown health report (autosmoke-report.md)
npx @ssgk4422/autosmoke report

# Target specific custom port
npx @ssgk4422/autosmoke --port 8080

# Show help & options
npx @ssgk4422/autosmoke --help
```

---

### 🤖 Agent Skill Integration

AutoSmoke includes an open-standard [Agent Skill](skills/auto-smoke/SKILL.md) compliant with `agentskills.io`. AI coding agents can run `autosmoke scan` autonomously to verify their own code changes before completing a task.

---

### 📄 License

MIT © 2026 [Prabhakar Pal](https://github.com/SECRET4422). Free and open source.
