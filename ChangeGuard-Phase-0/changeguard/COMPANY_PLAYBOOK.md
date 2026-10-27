# Company Engineering Playbook

These rules apply to ChangeGuard development. They describe the expected
engineering process; they do not imply that future tooling or controls are
already implemented.

## TypeScript and maintainability

- Use TypeScript for product code and keep strict compiler checks enabled.
- Prefer explicit, narrow types at module boundaries.
- Keep modules focused and APIs small; avoid hidden global state.
- Make control flow and side effects easy to identify.
- Use comments to explain decisions or non-obvious constraints, not to restate
  the code.

## Naming and modularity

- Choose names that describe domain concepts and observable behavior.
- Keep command parsing, Git inspection, test adapters, requirement handling,
  orchestration, and reporting in distinct modules.
- Use consistent casing and file naming within each module.
- Avoid unnecessary abstraction until a real use case needs it.

## Errors and process behavior

- Fail visibly and provide actionable messages; do not silently convert errors
  into success or an "unverified" result without explanation.
- Preserve relevant error context without exposing secrets or excessive
  untrusted output.
- Define and document stable process exit codes before relying on them in
  automation.
- Handle interruption, timeouts, missing tools, and malformed input explicitly.

## Dependencies

- Prefer Node.js built-ins where they are sufficient.
- Add dependencies only for a concrete need; explain the benefit, maintenance
  cost, security implications, and alternatives.
- Use the repository's chosen package manager consistently once established.
- Keep development-only and runtime dependencies correctly separated.
- Review licenses, maintenance status, package provenance, and transitive
  dependencies before adoption.

## Code review

- Review changes against the requested phase, product requirements, and
  architecture.
- Check edge cases, unsafe command execution, data handling, and compatibility.
- Keep review feedback specific, actionable, and respectful.
- Do not treat an automated review or passing checks as proof of correctness.

## Testing

- Use unit tests for isolated logic, integration tests for module boundaries,
  end-to-end tests for user-visible CLI behavior, and regression tests for
  fixed defects.
- Prefer deterministic fixtures and temporary repositories over assumptions
  about the developer's working tree.
- Test failure, timeout, malformed input, and partial-evidence paths, not only
  success.
- Do not mark a test as passing unless it was run and its result observed.
- See `TEST_PLAN.md` for the product-specific future strategy.

## Security and secrets

- Never commit, print, or request secrets in source files.
- Keep local credentials and environment files out of Git and package contents.
- Treat the target repository and its test scripts as untrusted input.
- Avoid shell-string interpolation for commands; future execution must use
  carefully constructed argument arrays and documented boundaries.
- Request only the access needed for a task and make potentially destructive
  actions explicit.
- Report security concerns through a private channel; see `SECURITY.md`.

## Accessibility and usability

- Make CLI output understandable to screen readers and usable in narrow
  terminals.
- Do not rely on color alone to communicate verification status.
- Use clear wording, stable labels, and actionable error messages.
- Respect non-interactive and CI environments; avoid requiring a TTY for
  automation.

## Documentation and releases

- Keep setup, behavior, limitations, and examples aligned with actual
  implementation.
- Label planned behavior as planned and implemented behavior as implemented.
- Update `CHANGELOG.md` for user-visible changes.
- Do not publish to npm or deploy without explicit user approval.
- Do not claim a release or installation succeeded unless the result was
  observed.

## Definition of done

A change is done when it meets its authorized acceptance criteria, relevant
checks have been run and inspected, documentation is current, security and
failure cases have been considered, and `REPLIT.md` accurately records the
status and next step.

## Honest verification reporting

Passing tests are evidence about the cases they cover, not proof that an entire
application is correct. Reports must distinguish:

- **Verified:** a named check ran and passed, with its scope stated.
- **Failed:** a named check ran and failed, with its observed failure stated.
- **Unverified:** no relevant check ran, or available evidence is insufficient.

Always disclose the commands run, relevant limitations, and checks not run.
