import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { HELP_TEXT } from "../../src/commands/help.js";
import { runCli } from "../../src/cli.js";

function createCapture() {
  let output = "";
  const stream = new Writable({
    write(
      chunk: unknown,
      encoding: BufferEncoding,
      callback: (error?: Error | null) => void,
    ) {
      void encoding;
      output += String(chunk);
      callback();
    },
  });

  return {
    stream,
    get output() {
      return output;
    },
  };
}

describe("runCli", () => {
  it("--help prints usage and succeeds", () => {
    const stdout = createCapture();
    const stderr = createCapture();

    const exitCode = runCli(["--help"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(stdout.output).toContain("Usage: changeguard [options]");
    expect(stderr.output).toBe("");
  });

  it("no arguments prints welcome and usage, without running checks", () => {
    const stdout = createCapture();
    const stderr = createCapture();

    const exitCode = runCli([], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(stdout.output).toContain("ChangeGuard");
    expect(stdout.output).toContain("Usage: changeguard [options]");
    expect(stderr.output).toBe("");
  });

  it("--version prints the supplied package version", () => {
    const stdout = createCapture();
    const stderr = createCapture();

    const exitCode = runCli(
      ["--version"],
      stdout.stream,
      stderr.stream,
      () => "1.2.3-test",
    );

    expect(exitCode).toBe(0);
    expect(stdout.output).toBe("1.2.3-test\n");
    expect(stderr.output).toBe("");
  });

  it("unsupported arguments print an error and return usage exit code 2", () => {
    const stdout = createCapture();
    const stderr = createCapture();

    const exitCode = runCli(["--invalid-option"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(2);
    expect(stdout.output).toBe("");
    expect(stderr.output).toContain("Unsupported argument");
    expect(stderr.output).toContain("changeguard --help");
  });

  it("rejects extra arguments after a recognized option", () => {
    const stdout = createCapture();
    const stderr = createCapture();

    const exitCode = runCli(
      ["--version", "unexpected"],
      stdout.stream,
      stderr.stream,
    );

    expect(exitCode).toBe(2);
    expect(stderr.output).toContain("unexpected");
  });

  it("help text lists both supported long options", () => {
    expect(HELP_TEXT).toContain("--help");
    expect(HELP_TEXT).toContain("--version");
  });
});
