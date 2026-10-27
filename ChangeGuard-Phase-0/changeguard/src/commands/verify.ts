import {
  formatVerificationReport,
  hasNpmTestScript,
  inspectWorkingTree,
  resultExitCode,
  runNpmTest,
} from "../verification.js";

export const VERIFY_HELP = [
  "Usage: changeguard verify [--run-tests]",
  "",
  "Options:",
  "  --run-tests  Run the repository's npm test script (executes project code)",
].join("\n");

export async function runVerifyCommand(
  args: string[],
  stdout: NodeJS.WritableStream = process.stdout,
  stderr: NodeJS.WritableStream = process.stderr,
  cwd = process.cwd(),
): Promise<number> {
  const invalid = args.filter((argument) => argument !== "--run-tests");
  const duplicateRunFlag =
    args.filter((argument) => argument === "--run-tests").length > 1;
  if (invalid.length > 0 || duplicateRunFlag) {
    const unsupported = duplicateRunFlag
      ? [...invalid, "--run-tests (duplicate)"]
      : invalid;
    stderr.write(
      `Unsupported verify argument${unsupported.length === 1 ? "" : "s"}: ${unsupported.map((arg) => JSON.stringify(arg)).join(" ")}\n${VERIFY_HELP}\n`,
    );
    return 2;
  }

  const testWasRequested = args.includes("--run-tests");
  try {
    const { root, changes } = inspectWorkingTree(cwd);
    const testScriptAvailable = hasNpmTestScript(root);
    const testResult =
      testWasRequested && testScriptAvailable
        ? await runNpmTest(root)
        : undefined;

    stdout.write(
      formatVerificationReport({
        root,
        changes,
        testResult,
        testScriptAvailable,
        testWasRequested,
      }),
    );

    if (testWasRequested && !testScriptAvailable) return 1;
    return testWasRequested ? resultExitCode(testResult) : 0;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    stderr.write(`ChangeGuard verification could not complete: ${detail}\n`);
    return 1;
  }
}
