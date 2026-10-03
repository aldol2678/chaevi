# CHAEVI — AI Work Router

**Route your task to the right AI workflow.**

Describe what you want to accomplish. CHAEVI recommends a practical combination of AI, model, reasoning level, work environment, tools, and next actions.

## Why CHAEVI

The hard part is often no longer finding an AI tool. It is deciding **which AI, model, environment, and workflow are appropriate for the task in front of you**.

CHAEVI turns a plain-language task or goal into a smaller execution plan instead of defaulting to the strongest model or the most complicated workflow.

> Use the smallest resource combination that is sufficient to complete the job well.

## What it does

CHAEVI supports two complementary flows.

### Route a task

Examples:

- `Fix the login regression in this GitHub repository and prepare a PR.`
- `Compare two market-research reports and identify the strongest evidence.`
- `Turn this campaign brief into a presentation-ready document.`

CHAEVI recommends:

- AI / model choice;
- reasoning level;
- work environment;
- primary and supporting tools;
- expected output;
- confidence and rationale.

### Discover the next actions

Examples:

- `Build a small web product and validate whether people need it.`
- `Prepare a portfolio for a product role.`
- `Create a one-month certification study plan.`
- `Decide how to divide work across several AI tools.`

CHAEVI proposes up to five actions and groups them into **Now / Next / Later**. A selected action can then be routed through the task workflow.

## Design principles

- **Minimum sufficient resources** — more capable or expensive is not automatically better.
- **Goal before tool** — tools and keywords should not override the user's actual objective.
- **Explicit execution boundaries** — analysis, code execution, browser work, and deployment are different states.
- **Explain the recommendation** — recommendations include rationale and expected output rather than only a model name.
- **Privacy-preserving feedback** — local feedback does not store the raw task or goal text by default.
- **No automatic learning from feedback** — feedback is a review signal; rule changes require reproducible cases and regression checks.

## Quick start

Requirements:

- Node.js `>=22.13.0`
- npm

```bash
git clone https://github.com/aldol2678/chaevi.git
cd chaevi
npm install
npm run dev
```

Then open the local address printed by the development server.

### Validate a change

```bash
npm test
npm run lint
npm run build
```

## Privacy

Recommendation feedback is stored locally in the browser and is bounded to 100 structured records. Raw task and goal text are not included in the default feedback record.

If you contribute a reproduction case, remove private names, account identifiers, credentials, private links, customer data, and unnecessary project-specific details first.

See `FEEDBACK_TO_RULES_DESIGN.md` and the templates under `templates/` for the current feedback-review approach.

## Project structure

```text
app/            CHAEVI UI and routing logic
public/         product assets
tests/          routing and rendering regression coverage
templates/      sanitized feedback/reproduction templates
```

The public release intentionally excludes private operational history, deployment identifiers, transport packets, and unused starter infrastructure.

## Contributing

Focused bug fixes, reproducible routing cases, accessibility improvements, tests, documentation, and small portability improvements are welcome.

AI-assisted contributions are allowed. Contributors remain responsible for correctness, provenance, privacy, and third-party license compatibility.

See `CONTRIBUTING.md` before opening a pull request.

## Security

Do not post credentials, private data, proof-of-concept exploits, or sensitive vulnerability details in a public Issue.

See `SECURITY.md` for the reporting process.

## License

CHAEVI is released under the **MIT License**.

Copyright (c) 2026 ALDOL

## Status

CHAEVI is an early-stage project. Interfaces, routing rules, and supported workflows may change as real usage produces better evidence.

Maintained on a best-effort basis.

---

Made by **ALDOL**.
