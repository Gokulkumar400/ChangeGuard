# Changelog

All notable changes to ChangeGuard will be documented here. This project has
not released a package yet.

## Unreleased

### Phase 0 — Project structure and instructions

- Added the initial directory structure and documentation.
- Recorded the product scope, planned architecture, development phases, and
  future testing strategy.

### Phase 1 — Package foundation and basic CLI

- Added the private TypeScript npm package foundation and `changeguard` bin.
- Added help, version, no-argument usage, and invalid-argument behavior.
- Added focused Vitest tests and build, typecheck, lint, and package-validation
  scripts.
- Git change detection and the verification engine remain unimplemented.

### Phase 2 — Release preparation

- Updated the package description and MIT license metadata for public-package
  preparation.
- Replaced the MIT copyright-holder placeholder with the user-provided notice.
- Removed the private-only package flag as preparation for a future public
  release.
- Recorded a public npm registry lookup that found no package record for
  `changeguard` on 2026-10-27. The name is not reserved.
- The proposed lowercase `testpilot` name has a registry record. Three checked
  alternatives returned HTTP 404, but remain unreserved candidates; final name
  selection is pending.
- No package was published.
