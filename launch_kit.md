# 🚀 AutoSmoke Launch & Distribution Kit

Everything you need to distribute **`@ssgk4422/autosmoke`** across Reddit, Hacker News, Twitter/X, and developer communities.

---

## 1. Reddit Launch Post

*Post to: `r/vibecoding`, `r/Cursor`, `r/webdev`, `r/reactjs`, and `r/ClaudeAI`*  
*(Optimal posting time: Tuesday–Thursday 8:00 AM – 11:00 AM EST)*

### Title:
```
I built AutoSmoke: A zero-code regression guard for vibe-coders that catches when AI prompts break your localhost routes and buttons
```

### Post Body:
```markdown
Hey everyone! 👋

One of the biggest issues with vibe-coding (coding with Cursor, Claude, Lovable, Bolt) is that non-technical builders **don't write unit or end-to-end tests**.

You ask the AI to build a cool new feature, the AI modifies 5 files, and you have no idea that it **silently broke the `/login` page or rendered a white-screen React crash on `/checkout`** until hours later.

I built **`AutoSmoke`** to solve this completely without writing a single line of test code.

### 💨 What AutoSmoke does:
1. **Auto-Discovers Localhost**: Point it at your running dev server (`npm run dev`) on port 3000, 5173, 8080, etc.
2. **Zero-Code Invariant Matrix**: Automatically crawls all internal links (`/`, `/dashboard`, `/pricing`), extracts interactive buttons/forms, and verifies that every page renders HTTP 200 without error overlays.
3. **Background Regression Guard**: Watches your code in real-time. Whenever an AI prompt modifies a file, AutoSmoke runs a sub-second smoke pass in the background.
4. **Surgical Fix Prompt**: If an AI edit breaks a previously working route or button, AutoSmoke sounds an alarm and outputs the exact prompt to paste into Cursor/Claude to repair the regression!

### ⚡ Try it (100% Free, Local & Zero API Keys):
```bash
npx @ssgk4422/autosmoke
```

- **GitHub**: https://github.com/SECRET4422/autosmoke
- **npm**: https://www.npmjs.com/package/@ssgk4422/autosmoke

Feedback and feature requests are very welcome!
```

---

## 2. Hacker News (Show HN)

*Post to: [news.ycombinator.com/submit](https://news.ycombinator.com/submit)*

### Title:
```
Show HN: AutoSmoke – Zero-code automated regression guard for localhost dev servers
```

### URL:
```
https://github.com/SECRET4422/autosmoke
```

### First Comment:
```markdown
Hi HN!

As more developers build applications using generative AI coding tools (Cursor, Claude Code, Aider), the speed of code modification has outpaced manual sanity testing. Non-technical builders often accumulate silent regressions because writing and maintaining Playwright/Jest suites is high-friction.

`AutoSmoke` is a zero-configuration CLI tool that connects to any running localhost dev server, discovers all reachable routes and interactive elements, and continuously monitors the application for state regressions.

Key features:
- Automatically probes ports and identifies framework runtime (Vite, Next.js, React, Svelte, Vue, Astro).
- Evaluates route integrity, runtime crash overlays, dead buttons, and form targets.
- Runs sub-second invariant verification passes on every file change.
- Outputs diagnostic fix prompts when a regression occurs.

MIT licensed, zero external telemetry, zero API keys required:
https://github.com/SECRET4422/autosmoke

I'd love your thoughts on automated invariant generation!
```

---

## 3. Twitter / X Launch Thread

```text
1/4 💨 What if you never had to write a frontend test again, but your AI coding prompts never broke your app?

Introducing AutoSmoke: The Zero-Code Automated Regression Guard for Localhost. 🧵👇

2/4 🔍 How it works:
Run `npx @ssgk4422/autosmoke` next to your dev server.

It crawls your localhost, discovers every route, button, and form, and creates a live Health Invariant baseline in <40ms.

3/4 🚨 When an AI prompt silently breaks a previously working page or button:
- AutoSmoke triggers an instant regression alert
- Tells you what broke and what file caused it
- Gives you a 1-click prompt to paste into Cursor / Claude to fix it!

4/4 🚀 100% Free & Zero API Keys:

npx @ssgk4422/autosmoke

⭐ GitHub: https://github.com/SECRET4422/autosmoke
📦 npm: https://www.npmjs.com/package/@ssgk4422/autosmoke
```
