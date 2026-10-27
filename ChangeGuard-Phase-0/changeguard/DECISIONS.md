# Architecture Decision Log

This log records decisions and their rationale. Decisions may be revisited when
new evidence or user requirements justify doing so.

## TypeScript for the initial implementation

- **Decision:** Use TypeScript for the initial Node.js implementation.
- **Rationale:** TypeScript is the declared initial target and supports explicit
  module boundaries as the CLI and adapters grow.
- **Status:** Accepted and used for the Phase 1 CLI foundation.

## npm CLI distribution

- **Decision:** Plan for an npm-distributed CLI whose command name is
  `changeguard`.
- **Rationale:** The product is intended to run directly in Node.js and
  TypeScript project workflows.
- **Package name:** The current `package.json` name metadata, `changeguard`, is
  provisional. An unauthenticated request to the public npm registry on
  2026-10-27 returned HTTP 404, so no package record was found at that time. This
  does not reserve the name or guarantee future availability. The command name
  and npm package name are separate choices.
- **Candidate checks:** The user-proposed spelling `TestPilot` contains
  uppercase letters; the lowercase form `testpilot` returned HTTP 200. The
  alternatives `changeguard-cli`, `changeguard-verify`, and `changeguard-check`
  each returned HTTP 404 on 2026-10-27. None is reserved by these checks.
- **Status:** The local CLI command is `changeguard`; final npm package name
  selection remains pending user confirmation. Recheck availability before
  publication. No package has been published.

## Phase-gated package release

- **Decision:** Keep the package private through Phase 1; do not check registry
  availability, select the final npm package name, or publish before Phase 2.
- **Rationale:** Phase 1 validates a local CLI and package. Registry checks,
  final name selection, and any first publication belong to the separately
  authorized release phase.
- **Status:** Active process rule.

## Phase-gated development

- **Decision:** Develop in explicit phases and wait for user review before
  starting the next phase.
- **Rationale:** This keeps scope reviewable and prevents later functionality or
  publication from being assumed as approved.
- **Status:** Active process rule.
