import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { Writable } from "node:stream";
import {
  formatVerificationReport,
  hasNpmTestScript,
  parseGitStatus,
  resultExitCode,
  runNpmTest,
} from "../../src/verification.js";
import { runVerifyCommand } from "../../src/commands/verify.js";

function capture() {
  let output = "";
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += String(chunk);
      callback();
    },
  });
  return { stream, get output() { return output; } };
}

describe("parseGitStatus", () => {
  it("classifies modified, added, deleted, and untracked files", () => {
    expect(
      parseGitStatus(" M changed.ts\0A  staged.ts\0 D removed.ts\0?? new file.ts\0"),
    ).toEqual([
      { path: "changed.ts", kind: "modified" },
      { path: "staged.ts", kind: "added" },
      { path: "removed.ts", kind: "deleted" },
      { path: "new file.ts", kind: "added" },
    ]);
  });

  it("preserves both paths for a rename", () => {
    expect(parseGitStatus("R  new name.ts\0old name.ts\0")).toEqual([
      {
        path: "new name.ts",
        kind: "renamed",
        previousPath: "old name.ts",
      },
    ]);
  });

  it("does not produce changes for a clean tree", () => {
    expect(parseGitStatus("")).toEqual([]);
  });
});

describe("verification reporting", () => {
  it("reports that tests were not run and behavior remains unverified", () => {
    const report = formatVerificationReport({
      root: "/tmp/example",
      changes: [{ path: "src/a.ts", kind: "modified" }],
      testScriptAvailable: true,
      testWasRequested: false,
    });
    expect(report).toContain("NOT RUN: npm test");
    expect(report).toContain('modified: "src/a.ts"');
    expect(report).toContain("Behavior-level requirements");
  });

  it("does not call a passing test suite proof of correctness", () => {
    const report = formatVerificationReport({
      root: "/tmp/example",
      changes: [],
      testResult: { state: "passed", exitCode: 0 },
      testScriptAvailable: true,
      testWasRequested: true,
    });
    expect(report).toContain("PASS: npm test");
    expect(report).toContain("does not prove the application is correct");
  });

  it("reports failed checks and explains how to inspect suppressed output", () => {
    const report = formatVerificationReport({
      root: "/tmp/example",
      changes: [],
      testResult: { state: "failed", exitCode: 1, signal: null },
      testScriptAvailable: true,
      testWasRequested: true,
    });
    expect(report).toContain("FAIL: npm test (exit code 1)");
    expect(report).toContain("run npm test manually to inspect the failure");
    expect(report).toContain("Behavior-level requirements");
  });

  it("returns failure exit status for test failures and timeouts", () => {
    expect(resultExitCode({ state: "failed", exitCode: 1, signal: null })).toBe(1);
    expect(resultExitCode({ state: "timed-out", timeoutMs: 10 })).toBe(1);
    expect(resultExitCode({ state: "passed", exitCode: 0 })).toBe(0);
  });
});

describe("npm test discovery", () => {
  const directories: string[] = [];
  const makeProject = () => {
    const root = mkdtempSync(join(tmpdir(), "changeguard-test-"));
    directories.push(root);
    return root;
  };

  afterAll(() => {
    for (const directory of directories) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("reads a test script from package metadata without executing it", () => {
    const root = makeProject();
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ scripts: { test: "node -e process.exit(99)" } }),
    );
    expect(hasNpmTestScript(root)).toBe(true);
  });

  it("returns false when package metadata has no test script", () => {
    const root = makeProject();
    mkdirSync(join(root, "nested"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {} }));
    expect(hasNpmTestScript(root)).toBe(false);
  });

  it("reports malformed package metadata clearly", () => {
    const root = makeProject();
    writeFileSync(join(root, "package.json"), "{invalid");
    expect(() => hasNpmTestScript(root)).toThrow("not valid JSON");
  });

  it("runs the explicit npm test script and reports a passing result", async () => {
    const root = makeProject();
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ scripts: { test: "node -e \"process.exit(0)\"" } }),
    );
    await expect(runNpmTest(root)).resolves.toEqual({
      state: "passed",
      exitCode: 0,
    });
  });

  it("reports a nonzero test exit as a failure", async () => {
    const root = makeProject();
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ scripts: { test: "node -e \"process.exit(7)\"" } }),
    );
    await expect(runNpmTest(root)).resolves.toMatchObject({
      state: "failed",
      exitCode: 7,
    });
  });

  it("terminates a test process that exceeds its timeout", async () => {
    const root = makeProject();
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({
        scripts: { test: "node -e \"setInterval(() => {}, 1000)\"" },
      }),
    );
    await expect(runNpmTest(root, 100)).resolves.toEqual({
      state: "timed-out",
      timeoutMs: 100,
    });
  });
});

describe("verify command arguments", () => {
  const directories: string[] = [];
  afterAll(() => {
    for (const directory of directories) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects unsupported arguments without inspecting a repository", async () => {
    const stdout = capture();
    const stderr = capture();
    const code = await runVerifyCommand(
      ["--execute-arbitrary"],
      stdout.stream,
      stderr.stream,
    );
    expect(code).toBe(2);
    expect(stdout.output).toBe("");
    expect(stderr.output).toContain("Unsupported verify argument");
    expect(stderr.output).toContain("--run-tests");
  });

  it("returns a failure when tests were requested but no npm test script exists", async () => {
    const root = mkdtempSync(join(tmpdir(), "changeguard-test-"));
    directories.push(root);
    execFileSync("git", ["init", "--quiet"], { cwd: root });
    const stdout = capture();
    const stderr = capture();
    const code = await runVerifyCommand(
      ["--run-tests"],
      stdout.stream,
      stderr.stream,
      root,
    );
    expect(code).toBe(1);
    expect(stdout.output).toContain("NOT RUN: no npm test script");
    expect(stderr.output).toBe("");
  });
});
