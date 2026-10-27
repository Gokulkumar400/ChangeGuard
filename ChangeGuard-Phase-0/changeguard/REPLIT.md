# ChangeGuard

ChangeGuard is an npm CLI project for detecting code changes, reusing existing
tests, running relevant verification checks, maintaining project-specific
requirements, and reporting what is verified, failed, or still unverified. Its
current implementation is limited to the Phase 1 CLI foundation.

## Project identity and status

- **Project root:** `changeguard/` in this Replit workspace. Run ChangeGuard
  commands from this directory. The outer workspace has its own files and
  tooling; do not treat it as ChangeGuard's package root.
- **Current phase:** Phase 2 — npm package release preparation.
- **Phase status:** Preparation is in progress. The package has not been
  published.
- **Implementation status:** Basic CLI help, version, usage, and invalid-argument
  handling are implemented. Git detection and verification functionality are not.
- **Published npm package:** No.
- **Completed in Phase 0:** Project structure, documentation, and handover review.
- **Completed in Phase 1:** Local npm package foundation and minimal CLI,
  documented below with observed validation evidence.
- **Pending user decisions:** Confirm the final npm package name. The user
  selected initial version `0.0.0`; the current package name remains provisional.
- **Immediate next task:** Resolve release details and package validation, then
  request explicit user approval before publication.
- **Next phase:** Phase 3 — Git change detection, only after Phase 2 is accepted.

## Instructions for every new AI agent

1. Read this `REPLIT.md` first.
2. Then read `COMPANY_PLAYBOOK.md`, `PRODUCT_SPEC.md`, `DEVELOPMENT_PLAN.md`,
   `ARCHITECTURE.md`, `TEST_PLAN.md`, and `DECISIONS.md` as relevant to the task.
3. Inspect the actual repository and Git status before editing.
4. Treat the current repository and verified test results as the source of truth.
   Never assume a previous agent's claims are correct.
5. Preserve completed work unless a justified change is required.
6. Work only on the currently authorized phase.
7. Do not silently skip requirements or proceed to a later phase.
8. Never claim a command, test, build, publication, or deployment succeeded unless
   its actual result was observed.
9. Never invent file contents, dependencies, test results, or package availability.
10. Explain proposed changes before making significant architectural changes.
11. Prefer small, reviewable changes over large rewrites.
12. Keep dependencies minimal and explain why new dependencies are needed.
13. Never expose, print, commit, or request that secrets be pasted into source files.
14. Never publish to npm or deploy without explicit user approval.
15. Never delete project data or overwrite user changes without permission.
16. If requirements conflict or essential information is missing, stop and ask
    the user.

## Phase workflow

For every phase:

1. Read the requirements and inspect the current state.
2. State the planned changes.
3. Implement only the authorized scope.
4. Run applicable tests and quality checks.
5. Inspect the actual results and fix failures.
6. Update the relevant documentation and `CHANGELOG.md` where appropriate.
7. Update this file with the real phase status, completed work, validation evidence,
   and exact next step.
8. Report modified files, commands run, results, remaining issues, and anything
   requiring user action.
9. Stop and wait for user validation before moving to the next phase.

## Account and agent switching

- Keep essential instructions, architectural decisions, setup commands, and
  progress in the repository; do not rely on chat history or agent memory.
- The ChangeGuard project root is `changeguard/` within the Replit workspace.
  Inspect that directory and its Git status before making changes.
- Do not store Replit credentials, account details, or private session data here.
- If repository access or previous state is missing, report the limitation rather
  than pretending the work is available.

## Phase 0 validation record

- The requested project structure and Phase 0 documentation are present.
- Phase 0 added no product functionality or dependencies.
- The npm package name was marked provisional; no registry check or publication
  was performed in Phase 0.

## Phase 1 validation record

- **Runtime observed:** Node.js `v24.22.1`; npm `11.19.1`.
- **Dependency installation command:** `npm install --prefix changeguard
  --save-dev --before=2026-10-25T00:00:00Z typescript @types/node vitest eslint
  typescript-eslint` — completed; npm reported zero vulnerabilities. The release
  cutoff preserves the workspace's one-day package-age safeguard.
- **Development dependencies added:** `typescript` `^6.0.3` for TypeScript
  compilation; `@types/node` `^26.6.5` for Node.js types; `vitest` `^5.0.5` for
  focused tests; `eslint` `^10.13.0` and `typescript-eslint` `^8.72.0` for linting
  TypeScript. No runtime dependencies were added.
- **Build:** `cd changeguard && npm run build` — passed; emitted `dist/`.
- **Type check:** `cd changeguard && npm run typecheck` — passed.
- **Tests:** `cd changeguard && npm test` — passed; 2 test files, 10 tests.
- **Lint:** `cd changeguard && npm run lint` — passed.
- **Package dry run:** `cd changeguard && npm run validate:package` — passed;
  the tarball preview contained exactly these 9 files: `LICENSE`, `README.md`,
  `dist/cli.js`, `dist/cli.js.map`, `dist/commands/help.js`,
  `dist/commands/help.js.map`, `dist/commands/version.js`,
  `dist/commands/version.js.map`, and `package.json`.
- **Local install:** `npm pack --pack-destination <temporary-directory>` and
  `npm install --prefix <temporary-directory>/install <tarball>` — passed; one
  local package installed. The installed `changeguard` binary returned code `0`
  and usage output for `--help` and no arguments, printed `0.0.0` for
  `--version`, and returned code `2` for an invalid argument.
- **Temporary-path evidence:** Final validation ran `npm pack
  --pack-destination /tmp/tmp.7NngCELpWt`, then
  `npm install --prefix /tmp/tmp.7NngCELpWt/install
  /tmp/tmp.7NngCELpWt/changeguard-0.0.0.tgz`. The installed binary path was
  `/tmp/tmp.7NngCELpWt/install/node_modules/.bin/changeguard`.
- **Initial check failures and fixes:** The first build/typecheck run required
  explicitly enabling Node types in `tsconfig.json`. The first lint run needed a
  narrow exception for the CommonJS config files. The first Vitest run emitted
  a config-loader warning; the config was changed to CommonJS and the final test
  rerun passed without that warning.
- **Not run:** npm registry name-availability checks and `npm publish` were
  deliberately not run; both are deferred to Phase 2. No command required by
  the Phase 1 validation plan remains unrun.
- **Phase 1 scope check:** At the end of Phase 1, the package was private and its
  name metadata was provisional. No Git detection, test discovery, verifier, or
  later-phase functionality was added in that phase.

## Phase 2 release-preparation record

- **Registry lookup:** On 2026-10-27, a direct unauthenticated request to
  `https://registry.npmjs.org/changeguard` returned HTTP `404`. No public package
  record was found at that time. This is not a reservation or guarantee of
  future availability. An initial npm lookup was routed through Replit's
  internal package firewall and was not used as public-registry evidence.
- **User-proposed alternative:** `TestPilot` contains uppercase letters; the
  lowercase lookup `https://registry.npmjs.org/testpilot` returned HTTP `200`,
  indicating an existing registry record.
- **Alternative candidates checked:** Direct unauthenticated requests for
  `changeguard-cli`, `changeguard-verify`, and `changeguard-check` each returned
  HTTP `404` on 2026-10-27. These names are not reserved and still require
  confirmation and a fresh check before publication.
- **Metadata review:** The local command/bin mapping and `dist` file inclusion
  were retained. The package description now reflects the actual CLI
  foundation, and `license: MIT` matches the existing MIT license text.
  `private: true` was removed to prepare for public release. The MIT copyright
  placeholder was replaced with the value supplied by the user; no publication
  was performed.
- **Other public metadata:** No author, repository, homepage, or support URL was
  added because no verified values were present in the repository.
- **Unchanged pending user decisions:** The package name remains `changeguard`
  but provisional. Version `0.0.0` is unchanged as selected by the user.
- **Prior package validation:** `cd changeguard && npm run validate:package`
  passed after the first metadata changes, before the user-provided copyright
  update and final name selection. The dry-run archive contained 9 files:
  `LICENSE`, `README.md`, `dist/cli.js`, `dist/cli.js.map`,
  `dist/commands/help.js`, `dist/commands/help.js.map`,
  `dist/commands/version.js`, `dist/commands/version.js.map`, and
  `package.json`. A final dry run remains pending name selection.
- **Checks not repeated:** Build, typecheck, tests, and lint were not rerun because
  no source, test, or dependency files changed. Their Phase 1 results remain
  recorded above. The local install was also not repeated after metadata-only
  changes.
- **Not performed:** No npm login, token use, npm publication, Git commit, or
  Git push. Final name confirmation and explicit publication approval remain
  outstanding. The release owner and versioning policy from the Phase 2 plan
  are not verified in the repository.

## Initial verification workflow

- **Implemented:** `changeguard verify` reads Git working-tree status without
  modifying it, lists added/modified/deleted/renamed paths, and reports
  unverified behavior. It does not compare committed history against a base
  branch or map tests to changed requirements.
- **Explicit test execution:** `changeguard verify --run-tests` reads only the
  root `package.json` to look for a non-empty `scripts.test`, then invokes the
  fixed `npm test` command. The script is not run by default. It has a
  two-minute timeout, its output is suppressed, and it is not sandboxed.
- **Observed runtime smoke checks:** Node.js 24.22.1's built-in TypeScript
  syntax stripping was used to exercise the source modules. Status parsing,
  temporary-Git-repository change inspection, passing and failing npm test
  scripts, timeout termination, report wording, and CLI-command exit status
  passed.
- **Not run:** The package TypeScript build/typecheck, Vitest suite, and ESLint
  could not be run because the package dependencies are not installed in this
  extracted project. The native runtime smoke checks do not replace those
  checks.
- **Known limits:** Only the root npm test script is supported; test-to-change
  mapping, requirement configuration, branch comparison, additional runners,
  and JSON reports remain future work.
