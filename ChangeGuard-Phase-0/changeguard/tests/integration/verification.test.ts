import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { inspectWorkingTree } from "../../src/verification.js";

const repositories: string[] = [];

afterAll(() => {
  for (const repository of repositories) {
    rmSync(repository, { recursive: true, force: true });
  }
});

describe("Git working-tree inspection", () => {
  it("reports added, modified, deleted, and renamed paths without changing files", () => {
    const root = mkdtempSync(join(tmpdir(), "changeguard-git-"));
    repositories.push(root);
    execFileSync("git", ["init", "--quiet"], { cwd: root });
    execFileSync("git", ["config", "user.name", "ChangeGuard Test"], {
      cwd: root,
    });
    execFileSync("git", ["config", "user.email", "changeguard@example.test"], {
      cwd: root,
    });

    const originalContent = "stable content for rename detection\n".repeat(5);
    writeFileSync(join(root, "changed.ts"), "before\n");
    writeFileSync(join(root, "removed.txt"), "remove me\n");
    writeFileSync(join(root, "old name.txt"), originalContent);
    execFileSync("git", ["add", "--all"], { cwd: root });
    execFileSync("git", ["commit", "--quiet", "-m", "baseline"], {
      cwd: root,
    });

    writeFileSync(join(root, "changed.ts"), "after\n");
    unlinkSync(join(root, "removed.txt"));
    renameSync(join(root, "old name.txt"), join(root, "new name.txt"));
    writeFileSync(join(root, "untracked file.ts"), "new\n");
    execFileSync("git", ["add", "--all"], { cwd: root });

    const { root: detectedRoot, changes } = inspectWorkingTree(root);
    expect(detectedRoot).toBe(root);
    expect(changes).toEqual(
      expect.arrayContaining([
        { path: "changed.ts", kind: "modified" },
        { path: "removed.txt", kind: "deleted" },
        {
          path: "new name.txt",
          kind: "renamed",
          previousPath: "old name.txt",
        },
        { path: "untracked file.ts", kind: "added" },
      ]),
    );
    expect(readFileSync(join(root, "changed.ts"), "utf8")).toBe("after\n");
    expect(readFileSync(join(root, "new name.txt"), "utf8")).toBe(
      originalContent,
    );
  });

  it("fails clearly outside a Git working tree", () => {
    const directory = mkdtempSync(join(tmpdir(), "changeguard-no-git-"));
    repositories.push(directory);
    expect(() => inspectWorkingTree(directory)).toThrow(
      "Could not find a Git repository",
    );
  });
});
