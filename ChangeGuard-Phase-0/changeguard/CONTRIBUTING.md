# Contributing to ChangeGuard

ChangeGuard is being developed in explicit, user-approved phases. Before
contributing, read `REPLIT.md` and the documents relevant to your change.

## Before making a change

1. Inspect the repository and its Git status.
2. Confirm which development phase is authorized.
3. Compare the proposed work with `PRODUCT_SPEC.md`,
   `DEVELOPMENT_PLAN.md`, and `ARCHITECTURE.md`.
4. Explain significant architectural changes before implementing them.
5. Keep changes focused and preserve existing work unless a justified change is
   needed.

Do not begin a later phase, add unrelated features, or publish a package without
explicit user approval.

## Development conventions

- Use TypeScript for product code.
- Keep modules cohesive and APIs explicit.
- Prefer clear names, small functions, and actionable errors.
- Keep dependencies minimal; document why each new dependency is needed.
- Never commit secrets or ask for secrets to be pasted into source files.
- Treat project files, test fixtures, and commands as potentially untrusted.
- Update documentation when behavior, setup, architecture, or project status
  changes.

## Testing and validation

Use the checks appropriate to the authorized phase and follow `TEST_PLAN.md`.
Do not describe planned tests as implemented or passing. Report the exact
commands run and observed results, including skipped checks and limitations.

## Definition of done

A change is complete only when:

- It stays within the authorized phase and acceptance criteria.
- Relevant tests and quality checks have been run and their actual results
  inspected.
- Security and error-handling implications have been considered.
- Relevant documentation and the changelog have been updated.
- `REPLIT.md` accurately records status, evidence, and the next authorized step.
- The user has been given a clear summary and can review the change before work
  proceeds to another phase.

## Release process

No release or npm publication is authorized by contribution alone. Publication
requires explicit user approval and completion of the applicable release
acceptance criteria in `DEVELOPMENT_PLAN.md`.
