# Product Specification

## Problem statement

AI coding agents can make changes across a project, while existing tests may
cover only part of the affected behavior. Developers need a clearer way to
identify changed files, reuse existing verification, and understand what the
available evidence does and does not establish.

## Target users

- Developers using AI coding agents in Node.js or TypeScript repositories.
- Teams that want a repeatable, change-aware verification step during local
  development or CI.
- Maintainers who need an honest summary of test evidence and remaining gaps.

## Product vision

ChangeGuard is intended to help users make informed decisions about code
changes by connecting changed files to relevant checks and project-specific
requirements. It must clearly distinguish verified behavior, failed checks,
and behavior that remains unverified. It must not claim that an entire
application is correct merely because a test suite passes.

## Initial scope

The initial target is a Node.js and TypeScript project, distributed as an npm
CLI with the command name `changeguard`. The product is planned to:

- Detect relevant changes in a Git working tree.
- Discover and reuse tests and checks already configured by the project.
- Run relevant checks and collect their results.
- Maintain project-specific requirements for change-aware verification.
- Report verified, failed, and unverified behavior with evidence and limitations.

Initial development and validation are planned to take place in Replit.

Potential later integrations include existing test frameworks, Playwright,
GitHub Actions, and a VS Code extension. They are not part of the Phase 0
implementation.

## Non-goals for the initial product

- Guaranteeing that an application is correct, secure, or bug-free.
- Replacing a project's existing test framework or CI system.
- Automatically changing application code to make tests pass.
- Running arbitrary repository commands without explicit, bounded execution
  rules.
- Supporting every language, framework, or Git hosting provider at launch.
- Claiming commercial validation or absence of competitors.
- Implementing a VS Code extension or broad hosted service in the initial CLI.

## Expected user workflow

The intended future workflow is:

1. A developer runs `changeguard` in a supported project.
2. The tool inspects Git changes and relevant project configuration.
3. The tool identifies available tests and configured requirements.
4. The developer reviews the checks to be run, where confirmation is required.
5. ChangeGuard runs permitted checks, records outcomes, and associates available
   evidence with affected behavior.
6. The developer receives a report separating verified, failed, and
   unverified items, including limitations.

This workflow is a product plan; no step is implemented in Phase 0.

## Functional requirements

Future implementation is expected to:

- Identify changed, added, deleted, and renamed files.
- Discover relevant existing tests and checks without assuming a single runner.
- Execute checks with explicit timeouts and observable outcomes.
- Support project-specific requirements through a documented configuration
  format.
- Associate check evidence with changes and requirements where feasible.
- Report pass, failure, skipped, timeout, and insufficient-evidence states
  distinctly.
- Explain which files, requirements, and checks were considered.
- Provide machine-readable output for later automation while retaining a
  readable terminal report.
- Avoid describing untested behavior as verified.

## Non-functional requirements

- **Safety:** Treat repository contents, scripts, configuration, and output as
  untrusted. Bound execution and make side effects explicit.
- **Transparency:** Explain the scope, evidence, and limitations behind every
  result.
- **Reliability:** Handle missing tools, malformed configuration, timeouts, and
  partial failures deterministically.
- **Usability:** Provide clear CLI help, actionable errors, accessible output,
  and support for non-interactive environments.
- **Maintainability:** Keep Git handling, test adapters, requirements,
  orchestration, and reporting modular.
- **Portability:** Target supported Node.js and TypeScript projects without
  assuming a specific test framework.

## Assumptions and known limitations

- The first target ecosystem is Node.js and TypeScript.
- The user has a working Git repository and may have existing tests.
- Test results only provide evidence for the cases and conditions actually
  exercised.
- Mapping a test to every changed behavior may be incomplete or impossible.
- Phase 0 contains no implementation, package tests, or verified user workflow.
- Commercial demand, competitor coverage, and product-market fit have not been
  established by this specification.

## MVP acceptance criteria

These are future product criteria, not Phase 0 accomplishments:

- A user can run the CLI in a supported Node.js/TypeScript Git project and
  understand the detected change set.
- Existing supported tests can be discovered and executed within documented
  safety and timeout boundaries.
- Project requirements can be configured and validated.
- The report distinguishes verified, failed, and unverified behavior, identifies
  the evidence used, and does not overstate test coverage.
- Malformed configuration, unavailable tools, failed checks, and timeouts
  produce clear results and appropriate process exit behavior.
- Installation and package contents are validated before a user-approved
  publication.
