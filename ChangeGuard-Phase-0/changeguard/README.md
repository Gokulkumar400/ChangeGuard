# ChangeGuard

ChangeGuard is a developer tool in development for checking code changes made
by AI coding agents. Its initial verification command inspects Git working-tree
changes and can optionally run the project's existing npm test script.

> **Status:** The CLI foundation and an initial, deliberately limited
> verification workflow are implemented. No npm package has been published.

## Product principles

- Report which behavior was verified, which checks failed, and what remains
  unverified.
- Do not claim an entire application is correct solely because a test suite
  passes.
- Treat repository content and commands as potentially untrusted.
- Make the evidence and limitations of each result visible.

## Intended audience

Developers and teams using AI coding agents in Node.js and TypeScript projects
who want a clearer, change-aware verification workflow.

## Project status

**Phase 0 and Phase 1 are complete. Phase 2 release preparation is validated
locally; final name and release-owner decisions remain pending.**
The initial verifier is available for local development; it does not yet map
tests to requirements or determine which behaviors a test covers. No npm package
has been published.
Initial development and validation are planned to take place in Replit.

See [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md) for the staged roadmap and
[`REPLIT.md`](REPLIT.md) for handover and agent instructions.

## Requirements and installation

- Node.js 24 or newer (validated with Node.js 24.22.1 and npm 11.19.1).
  The locked Vitest 5 development toolchain does not support Node.js 20.
- Git on `PATH` for `verify`; npm on `PATH` for `verify --run-tests`.
- No credentials, external service, or runtime npm dependencies are required.

No npm release exists yet. Do not use `npm install changeguard` or
`npx changeguard` as an installation path for this unreleased project.
The package name remains provisional.

From the imported repository root:

```sh
cd ChangeGuard-Phase-0/changeguard
npm ci
npm run build
node dist/cli.js --help
node dist/cli.js --version
```

If already inside the ChangeGuard package directory, omit the `cd` command.
Run `npm run build` before `npm test`, since CLI process tests use `dist/`.
Other checks are `npm run typecheck`, `npm run lint`, and
`npm run validate:package`. Packing automatically rebuilds the CLI.

For a local installation from the package directory:

```sh
pack_dir="$(mktemp -d)"
npm pack --pack-destination "$pack_dir"
install_dir="$(mktemp -d)"
cd "$install_dir"
npm init -y
npm install "$pack_dir/changeguard-0.0.0.tgz"
./node_modules/.bin/changeguard --help
./node_modules/.bin/changeguard --version
```

Keep the tarball path when installing into another project. This installs only
the built CLI, package metadata, README, changelog, and MIT license; no global
install or npm publication is needed. Run the installed binary from the Git
repository you want to inspect. `verify` uses that repository's top-level
directory, not the installation directory or a nested workspace package.

## CLI usage

```text
changeguard
changeguard --help
changeguard --version
changeguard verify
changeguard verify --run-tests
```

No arguments and `--help` print usage and exit `0`; `--version` prints
`0.0.0` and exits `0`. Unsupported arguments exit `2` with an error on stderr.
`verify` exits `0` for successful Git inspection, even when changes exist;
it does not assert that changed behavior is correct. `verify --run-tests`
exits `0` when the requested npm test script succeeds and `1` if it fails,
times out, is missing, or inspection cannot complete. Verification errors
exit `1`. Test failure details are suppressed: run `npm test` manually in the
inspected repository root to see its output.

### Verify working-tree changes

Run `node dist/cli.js verify` from a Git repository to list added, modified,
deleted, and Git-recognized renamed working-tree paths. Rename detection follows
Git status semantics. This inspects Git state only; project scripts are not run
by default. The command does not compare committed branch history with a base
branch.

To explicitly run the repository's `npm test` script, use:

```sh
node dist/cli.js verify --run-tests
```

This executes project-configured code, so only use it when you trust the
repository. ChangeGuard invokes `npm test` with an argument array and applies a
two-minute timeout; npm then runs the script defined by the repository. Test
output is suppressed; the report shows whether it passed, failed, or timed out.
If no `npm test` script exists, the request is reported as a failure rather
than silently skipped.

The report lists observed changes and check outcomes. It does not map tests to
requirements or claim changed behavior was verified. Even a passing test command
is evidence only for the cases it exercised.

An unauthenticated request to the public npm registry for
`changeguard` returned HTTP 404 on 2026-10-27, so no package record was found at
that time. This does not reserve the name or guarantee a future publish will
succeed; the package name remains provisional until confirmed and must be
rechecked before release. The CLI command name and npm package name are separate
decisions.

The user-proposed spelling `TestPilot` contains uppercase letters; the lowercase
name `testpilot` already has a public registry record. Alternative candidates
`changeguard-cli`, `changeguard-verify`, and `changeguard-check` returned HTTP
404 at lookup time, but none is reserved. Final package-name selection remains
pending.

The package version remains `0.0.0` as selected for the initial release. The
package declares MIT licensing, and the copyright-holder placeholder in
[`LICENSE`](LICENSE) has been replaced with the user-provided notice.

## License

The project uses the MIT License. The copyright notice in [`LICENSE`](LICENSE)
reflects the holder supplied by the user.
