# Test Plan

## Status

Phase 1 includes focused unit and CLI process tests for help, version, no
arguments, and invalid arguments. The initial verifier also has tests for Git
status parsing, changed path types, report limitations, npm test-script
discovery, test pass/failure/timeout results, and invalid verify arguments.
Remaining test-plan areas are still future work. Record observed results in
`REPLIT.md` before claiming they pass.

## Strategy

Use focused unit tests for isolated logic, integration tests for module
boundaries, CLI process tests for real invocation and exit behavior, and
end-to-end tests for complete verification workflows. Prefer deterministic
temporary projects and temporary Git repositories. Include regression coverage
for fixed defects.

## Planned test areas

### Unit tests

- Argument parsing, command routing, and exit-code mapping.
- Git status parsing and path classification.
- Configuration parsing, validation, and defaults.
- Test discovery and adapter selection.
- Requirement selection and evidence aggregation.
- Report formatting and machine-readable output.
- Output sanitization and error normalization.

### Integration tests

- Interactions among Git inspection, test discovery, execution, and reporting.
- Supported test-runner adapters with controlled fixture projects.
- Requirement configuration loading and change-aware selection.
- Partial evidence and mixed pass/failure outcomes.

### CLI process and exit-code tests

- Help and version commands.
- Valid and invalid arguments.
- Success, failed check, unavailable tool, malformed configuration, and
  insufficient evidence.
- Non-interactive invocation and stable documented exit codes.
- Signal handling and process cleanup.

### Temporary Git repository tests

Create isolated repositories and verify handling of:

- Clean state.
- Modified files.
- Added files.
- Deleted files.
- Renamed files.
- Multiple change types and unusual but valid paths.
- Missing Git executable or a directory that is not a repository.
- Relevant staged and unstaged states, once their semantics are specified.

Tests must not depend on or modify the developer's real Git repository.

### Test runner failure and timeout handling

- Passing and failing checks.
- Missing test commands and unavailable runners.
- Timeouts and terminated processes.
- Partial output and non-zero process exit.
- Child-process cleanup after failure or interruption.
- Large, malformed, or sensitive-looking output.

### Malformed configuration tests

- Invalid syntax and unsupported schema versions.
- Missing required fields and unknown values.
- Invalid, absolute, or traversal-like paths.
- Duplicate identifiers and conflicting requirements.
- Empty, oversized, or unexpected input.

### Security and untrusted-code execution tests

- Verify that repository content is not evaluated during discovery.
- Verify safe argument construction and resistance to shell metacharacter
  injection.
- Verify execution policy, timeout, and cleanup behavior.
- Verify paths cannot escape documented boundaries.
- Verify test output remains suppressed and is not written to the report.
- Verify the tool does not modify source files or Git state unless a future,
  explicitly approved feature specifies otherwise.

### Package-content and installation tests

- Inspect packed file lists for required files and unintended local content.
- Ensure credentials, local environment files, and development-only artifacts
  are excluded.
- Install the packed package in a clean temporary project.
- Invoke the installed command and verify help, version, and exit behavior.
- Confirm package metadata and command entry points match the release.

### Regression testing

Every fixed defect should gain a targeted test when practical. Run the relevant
regression tests and broader checks appropriate to the phase; report what was
not run.

### npm publication verification

Before any release, validate package contents, install the candidate package in
a clean project, verify metadata and command behavior, and inspect the
registry/name status. Publication is a separate action and requires explicit
user approval. Never report a publication as successful without observing the
actual result.

## Evidence and reporting

For every validation run, record the actual command, observed result, and
relevant limitations in the phase handover. A passing suite demonstrates only
that the tested cases passed; it is not proof of complete application
correctness.
