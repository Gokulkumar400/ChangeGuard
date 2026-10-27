import { spawn, spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export type ChangeKind = "added" | "modified" | "deleted" | "renamed";

export interface ChangedFile {
  path: string;
  kind: ChangeKind;
  previousPath?: string;
}

export type TestResult =
  | { state: "passed"; exitCode: 0 }
  | { state: "failed"; exitCode: number | null; signal: NodeJS.Signals | null }
  | { state: "timed-out"; timeoutMs: number }
  | { state: "error"; detail: string };

const GIT_TIMEOUT_MS = 10_000;
const TEST_TIMEOUT_MS = 120_000;
const PACKAGE_JSON_MAX_BYTES = 1_000_000;

export function parseGitStatus(status: string): ChangedFile[] {
  const fields = status.split("\0");
  const changes: ChangedFile[] = [];

  for (let index = 0; index < fields.length; index += 1) {
    const record = fields[index];
    if (!record) continue;

    const xy = record.slice(0, 2);
    const path = record.slice(3);
    const renamed = xy.includes("R") || xy.includes("C");
    const previousPath = renamed ? fields[index + 1] : undefined;
    if (renamed) index += 1;

    const kind: ChangeKind = renamed
      ? "renamed"
      : xy.includes("D")
        ? "deleted"
        : xy.includes("A") || xy === "??"
          ? "added"
          : "modified";

    changes.push({
      path,
      kind,
      ...(previousPath ? { previousPath } : {}),
    });
  }

  return changes;
}

function runGit(args: string[], cwd: string) {
  return spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    shell: false,
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: 1_000_000,
    windowsHide: true,
  });
}

export function inspectWorkingTree(cwd = process.cwd()): {
  root: string;
  changes: ChangedFile[];
} {
  const rootResult = runGit(["rev-parse", "--show-toplevel"], cwd);
  if (rootResult.error || rootResult.status !== 0) {
    throw new Error(
      "Could not find a Git repository from the current directory. Run verify inside a Git working tree.",
    );
  }

  const root = rootResult.stdout.trim();
  if (!root) throw new Error("Git returned an empty repository path.");

  const statusResult = runGit(
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    root,
  );
  if (statusResult.error || statusResult.status !== 0) {
    throw new Error("Git could not inspect the working tree.");
  }

  return { root, changes: parseGitStatus(statusResult.stdout) };
}

export function hasNpmTestScript(root: string): boolean {
  const packagePath = join(root, "package.json");
  let packageSize: number;
  try {
    packageSize = statSync(packagePath).size;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }

  if (packageSize > PACKAGE_JSON_MAX_BYTES) {
    throw new Error("package.json is larger than the supported 1 MB limit.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(packagePath, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The repository package.json is not valid JSON.");
    }
    throw error;
  }
  if (!parsed || typeof parsed !== "object") return false;
  const scripts = (parsed as { scripts?: unknown }).scripts;
  return (
    typeof scripts === "object" &&
    scripts !== null &&
    typeof (scripts as Record<string, unknown>).test === "string" &&
    (scripts as Record<string, string>).test.trim().length > 0
  );
}

function signalProcessTree(
  child: ReturnType<typeof spawn>,
  signal: NodeJS.Signals,
) {
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {
      // Fall back to signaling the direct child if the process group is gone.
    }
  }
  child.kill(signal);
}

export function runNpmTest(
  root: string,
  timeoutMs = TEST_TIMEOUT_MS,
): Promise<TestResult> {
  return new Promise((resolve) => {
    let settled = false;
    let timedOut = false;
    let forceKillTimer: NodeJS.Timeout | undefined;

    const finish = (result: TestResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      if (forceKillTimer) clearTimeout(forceKillTimer);
      resolve(result);
    };

    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(command, ["test"], {
      cwd: root,
      shell: false,
      detached: process.platform !== "win32",
      stdio: "ignore",
      windowsHide: true,
    });

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      signalProcessTree(child, "SIGTERM");
      forceKillTimer = setTimeout(
        () => signalProcessTree(child, "SIGKILL"),
        1_500,
      );
    }, timeoutMs);

    child.once("error", (error) => {
      finish({ state: "error", detail: error.message });
    });
    child.once("close", (exitCode, signal) => {
      if (timedOut) {
        finish({ state: "timed-out", timeoutMs });
      } else if (exitCode === 0) {
        finish({ state: "passed", exitCode: 0 });
      } else {
        finish({ state: "failed", exitCode, signal });
      }
    });
  });
}

export function formatVerificationReport(options: {
  root: string;
  changes: ChangedFile[];
  testResult?: TestResult;
  testScriptAvailable: boolean;
  testWasRequested: boolean;
}): string {
  const lines = [
    "ChangeGuard verification report",
    `Repository: ${JSON.stringify(options.root)}`,
    "Scope: Git working-tree changes compared with HEAD",
    "",
    `Changed files (${options.changes.length}):`,
  ];

  if (options.changes.length === 0) {
    lines.push("  None");
  } else {
    for (const change of options.changes) {
      const oldPath = change.previousPath
        ? ` (from ${JSON.stringify(change.previousPath)})`
        : "";
      lines.push(
        `  ${change.kind}: ${JSON.stringify(change.path)}${oldPath}`,
      );
    }
  }

  lines.push("", "Checks:");
  lines.push("  PASS: Git working-tree inspection");

  if (!options.testWasRequested) {
    lines.push(
      options.testScriptAvailable
        ? "  NOT RUN: npm test (pass --run-tests to execute the repository script)"
        : "  NOT RUN: no npm test script was found",
    );
  } else if (!options.testScriptAvailable) {
    lines.push("  NOT RUN: no npm test script was found");
  } else if (!options.testResult) {
    lines.push("  NOT RUN: test result unavailable");
  } else {
    switch (options.testResult.state) {
      case "passed":
        lines.push("  PASS: npm test (exit code 0)");
        break;
      case "failed":
        lines.push(
          `  FAIL: npm test (exit code ${options.testResult.exitCode ?? "unknown"}${options.testResult.signal ? `, signal ${options.testResult.signal}` : ""})`,
        );
        lines.push(
          "  Details: test output is suppressed; run npm test manually to inspect the failure.",
        );
        break;
      case "timed-out":
        lines.push(
          `  TIMEOUT: npm test exceeded ${options.testResult.timeoutMs} ms`,
        );
        lines.push(
          "  Details: test output is suppressed; run npm test manually to inspect the timeout.",
        );
        break;
      case "error":
        lines.push(
          `  ERROR: npm test could not start (${options.testResult.detail})`,
        );
        break;
    }
  }

  lines.push(
    "",
    "Unverified:",
    "  Behavior-level requirements and coverage of changed files were not mapped.",
    "  A passing test command is evidence only for the cases it exercised; it does not prove the application is correct.",
  );

  return `${lines.join("\n")}\n`;
}

export function resultExitCode(result?: TestResult): number {
  if (!result) return 0;
  return result.state === "passed" ? 0 : 1;
}
