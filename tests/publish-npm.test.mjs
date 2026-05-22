import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publishScriptPath = join(repoRoot, ".github/bin/publish-npm");

function withTempDir(run) {
  const root = mkdtempSync(join(tmpdir(), "publish-npm-test-"));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeExecutable(path, contents) {
  writeFileSync(path, contents, { mode: 0o755 });
}

function runPublishScript({
  packageJson,
  npmScript,
  nodeScript = "#!/usr/bin/env bash\necho 'Release artifact scan passed'\n",
  env = {},
}) {
  return withTempDir((root) => {
    const binDir = join(root, "bin");
    const pkgDir = join(root, "pkg");
    const summaryPath = join(root, "summary.md");

    mkdirSync(binDir, { recursive: true });
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, "package.json"), JSON.stringify(packageJson, null, 2));

    writeExecutable(join(binDir, "npm"), npmScript);
    writeExecutable(join(binDir, "node"), nodeScript);

    const stdout = execFileSync("bash", [publishScriptPath, pkgDir], {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...env,
        PATH: `${binDir}:${process.env.PATH}`,
        GITHUB_STEP_SUMMARY: summaryPath,
      },
      encoding: "utf8",
    });

    return {
      stdout,
      summary: readFileSync(summaryPath, "utf8"),
    };
  });
}

test("skips npm publish when the version is already on npm", () => {
  const result = runPublishScript({
    packageJson: {
      name: "@telnyx/test-pkg",
      version: "1.2.3",
      scripts: { build: "echo build-ok" },
    },
    env: {
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: "1",
    },
    npmScript: `#!/usr/bin/env bash
set -e
cmd="$1"
shift || true
case "$cmd" in
  run)
    echo "npm run $*"
    ;;
  view)
    echo '"1.2.3"'
    ;;
  pack)
    dest="$2"
    touch "$dest/fake.tgz"
    echo 'fake.tgz'
    ;;
  publish)
    echo 'PUBLISH_CALLED'
    exit 99
    ;;
  config)
    echo 'config-set'
    ;;
  *)
    echo "unexpected npm cmd: $cmd $*" >&2
    exit 98
    ;;
esac
`,
  });

  assert.match(result.stdout, /already published on npm; skipping publish\./);
  assert.doesNotMatch(result.stdout, /PUBLISH_CALLED/);
  assert.match(result.summary, /Gate result: \*\*allowed\*\*/);
});

test("blocks disabled publish attempts and records audit context", () => {
  const result = runPublishScript({
    packageJson: {
      name: "@telnyx/test-pkg",
      version: "1.2.3",
      scripts: { build: "echo build-ok" },
    },
    env: {
      NPM_PUBLISH_ENABLED: "false",
      NPM_PUBLISH_DISABLE_REASON: "incident containment",
      NPM_PUBLISH_DISABLE_INCIDENT_ID: "INC-42",
      NPM_PUBLISH_DISABLED_BY: "cto",
    },
    npmScript: `#!/usr/bin/env bash
echo "unexpected npm invocation: $*" >&2
exit 98
`,
  });

  assert.match(result.stdout, /NPM publishing is disabled via NPM_PUBLISH_ENABLED=false/);
  assert.match(result.stdout, /npm publish blocked/);
  assert.match(result.summary, /Gate result: \*\*blocked\*\*/);
  assert.match(result.summary, /- actor: cto/);
  assert.match(result.summary, /- reason: incident containment/);
  assert.match(result.summary, /- incident_id: INC-42/);
});
