# Architecture

## Status

The CLI foundation and an initial verification workflow are implemented. The
workflow detects Git working-tree changes, optionally runs a root-level npm test
script after an explicit `--run-tests` opt-in, and reports limitations. It does
not yet map changes to requirements or tests, support other test runners, or
produce machine-readable reports.

## Modules and planned extensions

### npm CLI entry point

The published package is intended to expose the `changeguard` command. The
entry point will parse arguments, select a command, coordinate core services,
and translate outcomes into documented process exit codes.

### Command handling

Command modules will define user-facing operations such as help, version, and
the future verification workflow. Argument validation and user-facing errors
should be kept separate from Git inspection and test execution.

### Git change detection

A Git module will inspect repository state and classify changed, added, deleted,
and renamed files. It should avoid modifying the worktree and clearly report
when Git state is unavailable or ambiguous.

### Test discovery and execution adapters

Adapters will discover existing project test commands and supported test
frameworks, then execute explicitly selected checks. The design should avoid
assuming one runner and should report unsupported or unrecognized configurations
instead of silently skipping them.

### Project requirement configuration

A requirements module will read and validate a documented, project-local
configuration format. Requirements should have stable identifiers and enough
context to support change-aware check selection and reporting.

### Verification orchestration

An orchestration layer will combine change data, requirements, discovered
checks, execution policies, and outcomes. It will preserve partial results and
distinguish a failed check from missing or inconclusive evidence.

### Evidence collection and reporting

The reporting layer will summarize the checks run, their scope, affected
requirements, results, and known gaps. It will produce readable terminal output
and a future machine-readable form. A passing test suite must never be
represented as proof that all application behavior is correct.

### Future integrations

GitHub Actions and potentially a VS Code extension may call the same core
interfaces as the CLI. Integrations are future work and should not fork or
misrepresent verification semantics.

## Conceptual flow

```text
CLI input
  -> argument and configuration validation
  -> Git change inspection
  -> requirement and test discovery
  -> check selection and safe execution
  -> evidence aggregation
  -> verified / failed / unverified report
```

The current implementation covers argument validation, Git working-tree
inspection, optional npm test execution, and a readable report. Requirement
mapping, broader test discovery, and machine-readable reporting remain planned.

## Security boundaries and safe execution

Repository content is untrusted. Future implementation must:

- Avoid evaluating repository data as code during discovery.
- Avoid shell-string interpolation; construct commands and arguments explicitly.
- Apply timeouts and handle process termination.
- Make command execution and potential side effects visible to the user.
- Avoid changing source files, Git state, or project configuration by default.
- Limit and sanitize captured output, especially where it may contain secrets.
- Validate configuration and paths before use.
- Avoid running checks automatically in contexts where execution is not
  authorized.
- Document what is executed and what the tool cannot safely inspect.

The current workflow implements the following boundaries:

- Git commands use fixed argument arrays without a shell.
- Repository `package.json` is parsed as data and capped at 1 MB.
- Project tests run only when `--run-tests` is explicitly supplied.
- The npm test process has a two-minute timeout and is terminated on timeout.
- Test output is suppressed; only the exit result is reported.

These controls do not sandbox npm scripts. An explicitly requested test script
can still perform arbitrary actions with the current user's permissions. Do not
run it for repositories you do not trust.

## Extension points

Keep interfaces explicit so later test-framework adapters and CI/editor
integrations can reuse change detection, requirements, orchestration, and
reporting without duplicating policy. Do not add abstractions until a concrete
adapter or integration requires them.
