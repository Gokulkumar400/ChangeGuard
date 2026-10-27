# Development Plan

Development is phase-gated. Work only on the phase explicitly authorized by the
user. Each phase ends with validation, documentation updates, a truthful
handover in `REPLIT.md`, and user review before the next phase.

## Phase 0 — Project structure and instructions

- **Goal:** Establish the initial directory structure, project handover, and
  product, architecture, process, and testing documentation.
- **Prerequisites:** Product intent and initial target ecosystem are known.
- **Acceptance criteria:** Requested files and directories exist; future plans
  are clearly distinguished from implementation; no CLI or test engine is
  implemented; secrets are absent; `REPLIT.md` and this plan agree on current
  phase and next step.
- **Validation:** Inspect the file tree and documents for completeness and
  consistency; confirm no product functionality, dependencies, or publication
  were introduced.
- **Status:** Complete — the Phase 0 documentation corrections and consistency
  review are complete. Phase 1 was later authorized and is now complete,
  awaiting user review.

## Phase 1 — Package foundation and basic CLI

- **Goal:** Establish a Node.js and TypeScript package with npm scripts, build
  TypeScript output to `dist/`, and expose a minimal CLI through the
  `package.json` `bin` mapping as `changeguard`.
- **Prerequisites:** Phase 0 is complete and the user explicitly authorizes
  Phase 1. Use Node.js with TypeScript and npm; record the actual Node.js and npm
  versions used in the phase evidence.
- **Scope:** Implement only package setup and argument handling for `--help`,
  `--version`, no arguments, and invalid arguments. Do not implement Git change
  detection, test discovery or execution, requirements, verification
  orchestration, evidence collection, or reports.
- **Required npm scripts:**
  - `build`: `tsc -p tsconfig.json` — emit JavaScript to `dist/`.
  - `typecheck`: `tsc --noEmit -p tsconfig.json`.
  - `test`: `vitest run`.
  - `lint`: `eslint .`.
  - `validate:package`: `npm pack --dry-run --json`.
- **CLI behavior:**
  - `changeguard --help` prints usage and the supported options to stdout and
    exits with code `0`.
  - `changeguard --version` prints the version from package metadata and exits
    with code `0`.
  - Running `changeguard` with no arguments prints the help/usage text and exits
    with code `0`; it must not inspect or execute project tests.
  - An unsupported argument prints an error and a usage hint to stderr and exits
    with code `2`.
  - `package.json` maps the `changeguard` command to `./dist/cli.js`; the built
    entry point begins with `#!/usr/bin/env node` and is directly executable by
    Node.js.
- **Acceptance criteria:**
  1. The TypeScript build emits `dist/cli.js` and the `bin` mapping points to
     that file.
  2. The five required npm scripts exist and run their stated checks.
  3. Unit and CLI process tests cover help, version, no arguments, invalid
     arguments, output streams, and the specified exit codes.
  4. No-argument execution does not invoke Git, discover tests, or run a
     verifier.
  5. The package remains private. The current npm package name metadata remains
     provisional; neither name availability nor a final package name is decided
     in Phase 1.
  6. No Git change detection or verification-engine functionality is present.
  7. No npm publication or registry name check is performed in Phase 1.
- **Validation commands and package check:**
  - `npm run build`
  - `npm run typecheck`
  - `npm test`
  - `npm run lint`
  - `npm run validate:package`
  - For local package validation, run this from the ChangeGuard project root:
    ```sh
    set -eu
    tmpdir="$(mktemp -d)"
    npm pack --pack-destination "$tmpdir"
    tarball="$(find "$tmpdir" -maxdepth 1 -name '*.tgz' -print -quit)"
    test -n "$tarball"
    npm install --prefix "$tmpdir/install" "$tarball"
    bin="$tmpdir/install/node_modules/.bin/changeguard"
    "$bin" --help
    "$bin" --version
    "$bin"
    if "$bin" --invalid-option; then
      echo "Expected invalid argument to exit with code 2" >&2
      exit 1
    else
      status=$?
      test "$status" -eq 2
    fi
    ```
    Verify the documented output and exit codes, including code `2` for the
    invalid argument.
- **Evidence required to complete Phase 1:** Record the actual Node.js and npm
  versions; the exact results of all five npm scripts; test results for each
  CLI behavior and exit code; the packed file list; the temporary installation
  result and observed installed-binary output; and confirmation that no
  verifier behavior or npm publication was added. Update `REPLIT.md` with these
  observed results and wait for user review before moving to Phase 2.
- **Status:** Implementation and all planned local validations are complete.
  Observed commands and results are recorded in `REPLIT.md`. Await user review
  before beginning Phase 2.

## Phase 2 — npm package-name check, publication preparation, and user-approved first release

- **Goal:** Check package-name availability, select the final npm package name,
  and prepare release metadata and package contents; publish the first release
  only after explicit user approval.
- **Prerequisites:** Phase 1 accepted; working package; verified release owner
  and versioning plan.
- **Acceptance criteria:** The provisional package name is checked and the final
  name is selected based on the observed result; name check is recorded;
  package contents and installation are validated; release notes and version
  are reviewed; publication occurs only if separately approved by the user.
- **Validation:** Inspect the packed package, test installation in a clean
  temporary project, verify registry/name status using an appropriate source,
  and record publication evidence only if publication was approved and actually
  observed.
- **Status:** Release preparation is in progress. The public registry lookup
  found no package record for `changeguard` on 2026-10-27, but the name is not
  reserved. The proposed lowercase `testpilot` name returned HTTP 200; the
  alternatives `changeguard-cli`, `changeguard-verify`, and `changeguard-check`
  returned HTTP 404 but are not reserved. Final name selection and
  release-owner/versioning-policy verification remain pending; version
  `0.0.0` and the MIT copyright holder were confirmed by the user. Publication
  has not occurred.

## Phase 3 — Git change detection

- **Goal:** Detect and classify relevant repository changes without modifying
  the worktree.
- **Prerequisites:** Accepted package foundation and CLI.
- **Acceptance criteria:** Changed, added, deleted, and renamed paths are
  represented correctly for documented Git states; errors and ambiguous states
  are explicit.
- **Validation:** Unit tests and temporary-Git-repository integration tests for
  clean, changed, added, deleted, renamed, and unavailable-repository cases.
- **Status:** The initial CLI inspects staged and unstaged working-tree changes,
  including added, modified, deleted, and Git-recognized renamed paths. It does
  not compare committed branch changes against a base branch.

## Phase 4 — Existing test discovery and execution

- **Goal:** Discover supported existing test commands and execute selected
  checks with bounded, observable behavior.
- **Prerequisites:** Accepted Git change detection; agreed adapter and execution
  safety design.
- **Acceptance criteria:** Supported checks can be identified and run; missing
  tools, failures, timeouts, interruptions, and unsupported setups are
  distinguishable; execution boundaries are documented.
- **Validation:** Adapter unit/integration tests and temporary-project process
  tests covering pass, failure, timeout, missing command, and interruption.
- **Status:** A root-level npm `test` script is identified by reading
  `package.json` as data and runs only with explicit `--run-tests` consent. It
  has a fixed two-minute timeout. Other package managers and test runners are
  not supported, and npm scripts are not sandboxed.

## Phase 5 — Persistent requirements and change-aware verification

- **Goal:** Define persistent project requirements and connect changes to
  relevant requirements and checks where evidence allows.
- **Prerequisites:** Accepted Git detection and test discovery/execution.
- **Acceptance criteria:** Configuration is documented and validated;
  malformed settings fail clearly; selected checks and requirements are
  explainable; uncertainty remains explicit.
- **Validation:** Configuration tests, change-to-requirement mapping tests,
  regression tests, and end-to-end temporary-project scenarios.
- **Status:** Not implemented. Changes are not yet connected to project-specific
  requirements or test coverage.

## Phase 6 — Evidence reports and test coverage gaps

- **Goal:** Report verification evidence, failures, unverified requirements, and
  coverage gaps in readable and machine-readable forms.
- **Prerequisites:** Accepted requirements and verification orchestration.
- **Acceptance criteria:** Reports identify checks and scope; verified, failed,
  and unverified statuses are distinct; passing tests are not presented as
  proof of full application correctness.
- **Validation:** Snapshot/schema tests, edge-case reports, and regression tests
  for partial evidence and mixed outcomes.
- **Status:** A readable terminal report lists changed paths and Git/npm test
  outcomes, and labels behavior as unverified. Requirement-level evidence,
  coverage mapping, and machine-readable reports are not implemented.

## Phase 7 — CI integration and release hardening

- **Goal:** Improve automation compatibility, operational safety, package
  quality, and release readiness.
- **Prerequisites:** Accepted evidence reporting and user approval for the
  specific CI/release work.
- **Acceptance criteria:** Documented non-interactive behavior and exit codes
  are stable; supported CI usage is documented; package and security checks are
  complete; no integration is claimed without a working, validated path.
- **Validation:** CLI process tests, CI workflow tests where available,
  package-content/install checks, dependency/security checks, and regression
  suite.

## Phase 8 — Real-project validation and product differentiation research

- **Goal:** Evaluate the product against representative real projects and
  research its differentiation without making unsupported market claims.
- **Prerequisites:** A usable MVP and explicit approval for project access and
  research scope.
- **Acceptance criteria:** Test projects and evaluation criteria are documented;
  findings distinguish observed evidence from hypotheses; no claim of
  commercial validation or absence of competitors is made without support.
- **Validation:** Record reproducible project evaluations, limitations,
  feedback sources, and research references; obtain permission for any private
  repository or user data used.
