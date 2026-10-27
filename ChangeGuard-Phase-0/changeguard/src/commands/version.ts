import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface PackageMetadata {
  version?: unknown;
}

export function readPackageVersion(): string {
  const packagePath = resolve(__dirname, "../../package.json");
  const metadata = JSON.parse(
    readFileSync(packagePath, "utf8"),
  ) as PackageMetadata;

  if (typeof metadata.version !== "string" || metadata.version.length === 0) {
    throw new Error("Package metadata does not contain a version.");
  }

  return metadata.version;
}
