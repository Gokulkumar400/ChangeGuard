import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const entryPoint = fileURLToPath(
  new URL("../../dist/cli.js", import.meta.url),
);
const packageMetadata = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { version: string };

function invokeCli(...args: string[]) {
  const result = spawnSync(process.execPath, [entryPoint, ...args], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

describe("built CLI process", () => {
  it("--help prints usage to stdout and exits 0", () => {
    const result = invokeCli("--help");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage: changeguard [options]");
    expect(result.stderr).toBe("");
  });

  it("--version prints package metadata and exits 0", () => {
    const result = invokeCli("--version");

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(`${packageMetadata.version}\n`);
    expect(result.stderr).toBe("");
  });

  it("no arguments prints help and exits 0", () => {
    const result = invokeCli();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("ChangeGuard");
    expect(result.stdout).toContain("Usage: changeguard [options]");
    expect(result.stderr).toBe("");
  });

  it("invalid arguments print to stderr and exit 2", () => {
    const result = invokeCli("--invalid-option");

    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unsupported argument");
    expect(result.stderr).toContain("changeguard --help");
  });
});
