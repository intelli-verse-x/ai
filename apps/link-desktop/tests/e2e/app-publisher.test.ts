import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { _electron, type ElectronApplication, type Page } from "playwright";
import {
  createLinkAppPublisherServer,
  LinkAppPublisherService,
  listenLinkAppPublisherServer,
} from "../../../../tools/link/src/app-publisher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "../..");

test("Electron app uses the managed publisher API for Apps catalog, duplicate, and review", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "link-desktop-publisher-e2e-"));
  const service = new LinkAppPublisherService({
    storagePath: path.join(tempDir, "catalog.json"),
    enforceReviewers: true,
  });
  service.createPublishIntent({
    app: {
      name: "Publisher E2E App",
      slug: "publisher-e2e-app",
      description: "Validates the desktop app publisher path through real Electron IPC.",
      owner_squad: "link-platform.squad",
      audience: "Link Platform",
      app_type: "web",
      access: "vpn",
      risk_level: "low",
      reviewers: ["link-platform.squad"],
      env_schema: ["TELNYX_AUTH_CONTEXT"],
    },
    source: {
      repo: "https://github.com/team-telnyx/mcp-apps",
      ref: "main",
      subdir: "apps/publisher-e2e",
    },
    build: {
      command: "npm run build",
      output_dir: "dist",
    },
  });

  const publisher = createLinkAppPublisherServer(service, { requireAuth: true, requireAuthContext: true });
  const listener = await listenLinkAppPublisherServer(publisher);
  const app = await launchElectron(listener.url, path.join(tempDir, "user-data"));

  try {
    const page = await app.firstWindow();
    await page.waitForLoadState("domcontentloaded");
    await openAppsTab(page);

    const statusText = await page.getByLabel("Publisher status").textContent();
    assert.match(statusText ?? "", /Publisher not ready/);
    assert.match(statusText ?? "", /Production Edge deployer/);

    const appCard = page.locator(".marketplaceCard").filter({ hasText: "Publisher E2E App" });
    await appCard.waitFor({ state: "visible", timeout: 20_000 });
    assert.match(await appCard.textContent() ?? "", /Preview/);

    await appCard.getByRole("button", { name: /Duplicate/ }).click();
    const duplicate = await waitForJsonResult(page, "source_ref");
    assert.deepEqual(duplicate.commands, [
      "git clone 'https://github.com/team-telnyx/mcp-apps' 'publisher-e2e-app'",
      "cd 'publisher-e2e-app'",
      "git checkout 'main'",
      "cd 'apps/publisher-e2e'",
    ]);
    assert.equal(duplicate.path, "publisher-e2e-app/apps/publisher-e2e");

    await appCard.getByRole("button", { name: /Approve/ }).click();
    const review = await waitForJsonResult(page, "App approved.");
    assert.equal(review.mode, "live");
    assert.equal(review.status, "approved");
    await page.waitForFunction(() => {
      const card = Array.from(document.querySelectorAll(".marketplaceCard")).find((element) => element.textContent?.includes("Publisher E2E App"));
      return card?.textContent?.includes("Approved");
    });
  } finally {
    await closeElectron(app);
    await listener.close();
    await rm(tempDir, { recursive: true, force: true });
  }
});

async function launchElectron(publisherUrl: string, userDataDir: string): Promise<ElectronApplication> {
  return _electron.launch({
    args: [
      path.join(appRoot, "src/main/main.js"),
      `--user-data-dir=${userDataDir}`,
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
    cwd: appRoot,
    env: {
      ...process.env,
      LINK_DESKTOP_RENDERER: "dist/renderer/index.html",
      LINK_APP_PUBLISHER_URL: publisherUrl,
      TELNYX_AUTH_REV2: "publisher-e2e-rev2",
      TELNYX_ACTOR: "publisher-e2e@telnyx.com",
      TELNYX_GROUPS: "link-platform.squad",
      TELNYX_ON_BEHALF_OF: "link-platform.squad",
      LINK_APP_PUBLISHER_LOCAL_FALLBACK: "0",
      SLACK_BOT_TOKEN: "",
      SLACK_USER_TOKEN: "",
      LITELLM_API_KEY: "",
      HINDSIGHT_API_KEY: "",
    },
  });
}

async function openAppsTab(page: Page): Promise<void> {
  await page.locator('button.railButton[title="Wiki"]').waitFor({ state: "visible", timeout: 20_000 });
  await page.locator('button.railButton[title="Wiki"]').click();
  await page.getByRole("tab", { name: "Apps" }).click();
  await page.getByLabel("Publisher status").waitFor({ state: "visible", timeout: 20_000 });
}

async function waitForJsonResult(page: Page, expectedText: string): Promise<Record<string, unknown>> {
  await page.waitForFunction((text) => document.querySelector(".resultPreview")?.textContent?.includes(String(text)), expectedText, { timeout: 20_000 });
  const text = await page.locator(".resultPreview").textContent();
  assert.ok(text, "Expected publisher result JSON to be visible.");
  return JSON.parse(text) as Record<string, unknown>;
}

async function closeElectron(app: ElectronApplication) {
  try {
    await app.close();
  } catch {
    await app.evaluate(({ app: electronApp }) => electronApp.quit()).catch(() => undefined);
  }
}
