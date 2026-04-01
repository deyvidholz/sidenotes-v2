# Contributing to Sidenotes V2

Thank you for your interest in contributing! This document covers how to get set up, the project conventions, and how to submit changes.

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sidenotes-v2.git`
3. Install dependencies: `npm install`
4. Generate icons: `npm run generate:icons`
5. Start the dev server: `npm run dev`

---

## Project Structure

See the **Architecture** section in [README.md](README.md) for a full file map.

The key principle: **each layer has one responsibility**.

- `src/types/` — shared TypeScript types and constants only. No logic.
- `src/storage/` — all reads/writes to persistent storage. No UI imports.
- `src/store/` — all application state and actions. No direct DOM manipulation.
- `src/utils/` — pure utility functions. No side effects, no imports from other src layers.
- `src/components/` — UI only. Components read from the store and dispatch actions; they don't manage their own persistence.

---

## Code Style

- TypeScript strict mode is enabled — avoid `any`
- Prefer explicit types over inference for function signatures
- Use named exports (not default exports) for components and utilities
- Keep components focused — if a component is doing too much, split it
- No inline styles unless Tailwind classes can't express the value (e.g., dynamic CSS variables or custom colors from the color theme map)
- Tailwind utility classes are preferred over custom CSS

---

## Submitting Changes

1. Create a branch: `git checkout -b feat/your-feature` or `fix/your-fix`
2. Make your changes
3. Run `npm run typecheck` to verify there are no TypeScript errors
4. Commit with a clear message: `git commit -m "feat: add export to markdown"`
5. Push and open a pull request against `main`

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) style:

```
feat: add tag support
fix: prevent duplicate note IDs on rapid creation
refactor: extract color theme utilities
docs: clarify sync limitations in README
chore: update dependencies
```

---

## Reporting Bugs

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Opera version and OS (if relevant)

---

## Feature Requests

Open a GitHub issue with the `enhancement` label. Describe the use case, not just the feature — "I want to X because Y" is more useful than "add feature Z".
