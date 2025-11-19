# Mermaid Agent Playbook

## Mission
Automate development, QA, and documentation work for the Mermaid Live Preview app so humans stay focused on design and diagram content. The agent inspects source, edits files, runs local commands, and reports back with precise file/line references.

## Operating Environment
- **Inputs:** user prompts, repo files, diffs, command output, and environment metadata (cwd, sandbox, approvals).
- **Sandbox:** workspace-write filesystem, restricted network, `zsh` shell. Destructive git actions (`reset --hard`, wiping user changes) are forbidden.
- **Tool belt:** `shell` for commands, `apply_patch` for surgical edits, `update_plan` for multi-step tracking, `view_image` for local screenshots.
- **Codebase:** React 19 + Vite 7 app (`src/App.jsx` contains most editor logic, theme + sample data, URL encoding via Pako, embed snippet builder). ESLint 9 and Prettier 3 run through Husky + lint-staged, with Yarn 1.x as the package manager.

## Standard Workflow
1. **Interpret & scope.** Restate the request mentally, note constraints, and decide whether a multi-step plan is required (skip only for trivial fixes).
2. **Inspect.** Prefer `rg` for search and `sed`/`cat` for targeted reads. Always set `workdir` when invoking `shell`.
3. **Plan & act.** Use `update_plan` for non-trivial tasks. Keep only one step `in_progress`.
4. **Edit safely.** Default to `apply_patch` for single-file updates, stay ASCII unless necessary, and add comments only when code is non-obvious.
5. **Validate.** Run linters/tests when relevant. If you skip verification, call it out explicitly in the final report.
6. **Summarize.** Final responses are concise, reference files with `path:line`, and follow the mandated bullet/formatting style. Highlight remaining risks or follow-up steps.

## Prompting Strategy
- **System prompt** sets the “Codex” role and formatting rules.
- **Developer prompt** reinforces repo conventions (no reverting user work, minimal comments, etc.).
- **User prompt** defines the specific goal; clarify only when blocking.
- Mirror the user’s tone, keep prose tight, and cite precise files to reduce back-and-forth.

## Quality Gates
- Cite every modified file with absolute or repo-relative paths plus 1-based line numbers (e.g., `src/App.jsx:210`).
- Mention tests you did or did not run.
- Watch for non-agent edits in the working tree; never discard them.
- Respect approval flow: request escalated permissions only after a sandboxed command fails or when a command obviously needs them.

## Representative Responses
1. **Bug fix:** confirm reproduction, inspect `src/App.jsx`, explain the root cause (e.g., missing `hashchange` listener), implement the fix, and recommend `yarn dev` for verification.
2. **Docs refresh:** rewrite `README.md` with mission, quick start, features, scripts, dev workflow, troubleshooting, and license details; summarize the deltas and cite the file lines touched.

## Common Failure Modes & Mitigations
- **Sandboxed command missing:** fall back to equivalent tooling already in the repo (e.g., use `rg` instead of `grep`).
- **Oversized output:** trim or summarize results; avoid overwhelming the CLI.
- **Assumption drift:** re-open files before editing to confirm current content.
- **Formatting slip-ups:** re-read the developer instructions before finalizing the response.

## Operational Notes
- Environment lives under `/Users/<user>/Documents/Workspace/mermaid-react`.
- Node 22+ & Yarn classic (≥1.22) are assumed; Vite dev server listens on port 5173 by default.
- Husky hooks fire on commit; keep lint/format scripts green to avoid breaking the pipeline.
- Production site is deployed via GitHub Pages at `https://mermaid-live-preview.wahthefox.com` using the committed `public/CNAME`.
