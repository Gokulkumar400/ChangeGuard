#!/usr/bin/env node

import { HELP_TEXT } from "./commands/help.js";
import { runVerifyCommand } from "./commands/verify.js";
import { readPackageVersion } from "./commands/version.js";

export function runCli(
  args: string[],
  stdout: NodeJS.WritableStream = process.stdout,
  stderr: NodeJS.WritableStream = process.stderr,
  getVersion: () => string = readPackageVersion,
): number {
  if (args.length === 0 || (args.length === 1 && args[0] === "--help")) {
    stdout.write(`${HELP_TEXT}\n`);
    return 0;
  }

  if (args.length === 1 && args[0] === "--version") {
    try {
      stdout.write(`${getVersion()}\n`);
      return 0;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      stderr.write(`Unable to read ChangeGuard version: ${detail}\n`);
      return 1;
    }
  }

  const received = args.map((argument) => JSON.stringify(argument)).join(" ");
  stderr.write(
    `Unsupported argument${args.length === 1 ? "" : "s"}: ${received}\n` +
      "Run 'changeguard --help' to see supported options.\n",
  );
  return 2;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "verify") {
    void runVerifyCommand(args.slice(1)).then((exitCode) => {
      process.exitCode = exitCode;
    });
  } else {
    process.exitCode = runCli(args);
  }
}
