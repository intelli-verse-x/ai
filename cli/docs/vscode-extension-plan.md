# Cursor-Compatible VS Code Extension Plan

This is a planning deliverable only. Do not implement, publish, or scaffold the full VS Code extension as part of AIF-240. The repo-local implementation for this issue is the `telnyx-agent setup-cursor-mcp` command, which future editor integrations can call.

## Goals

- Provide an official Cursor-compatible VS Code extension path for Telnyx developers.
- Make Telnyx MCP setup a one-click or command-palette action backed by the Agent CLI.
- Surface Telnyx Agent Skills, guides, and capability metadata inside the editor without duplicating source-of-truth content.
- Keep extension packaging separate from generated provider skill bundles unless a future PR intentionally adds a dedicated extension package.

## Target Features

- **MCP setup**: Configure project-level Cursor MCP settings by invoking `telnyx-agent setup-cursor-mcp --dir <workspace>`. The command writes `.cursor/mcp.json` with `type: "http"`, `url: "https://api.telnyx.com/v2/mcp"`, and `headers.Authorization: "Bearer ${env:TELNYX_API_KEY}"`.
- **Safe update UX**: Surface skipped/conflict/malformed-JSON states from the CLI and offer an explicit force action equivalent to `--force`.
- **Skills browser**: List Telnyx skills from this repo and provide copyable install commands.
- **Capability explorer**: Read `agent.json` and `telnyx-agent capabilities --json` to show available Telnyx actions and composite setup commands.
- **Command palette actions**: Expose commands such as `Telnyx: Configure Cursor MCP`, `Telnyx: Show Capabilities`, and `Telnyx: Open Skill Install Command`.
- **Docs links**: Deep link to relevant guides in `guides/`, toolkit docs in `tools/`, and MCP docs in `tools/mcp/`.

## Non-Goals for the First Extension Release

- Reimplement Telnyx API provisioning flows inside the extension host.
- Store or broker Telnyx API keys beyond what the existing CLI and MCP server authentication flow require.
- Publish generated copies of `skills/` that bypass the canonical skill source in this repo.
- Replace Cursor's native MCP configuration UI or future marketplace plugin path.

## Proposed Architecture

### Extension Package Location

Start in this monorepo only if the extension remains a thin wrapper around existing artifacts, for example `plugins/vscode/` or `plugins/cursor/`. If the extension needs substantial webviews, telemetry, release automation, marketplace assets, or a separate cadence, create a separate repository and reference it from this repo's README and `agent.json` metadata.

Recommended first decision: use a separate extension package/repo once publishing begins, while keeping this monorepo as the source of truth for CLI commands, skills, capability metadata, and guides.

### Runtime Components

- **VS Code extension host**: TypeScript extension using the VS Code API.
- **CLI bridge**: Spawn `telnyx-agent` or `npx -y @telnyx/agent-cli` for setup and capability discovery.
- **Workspace adapter**: Detect the active workspace folder and pass it as `--dir <workspace>` to setup commands.
- **MCP config adapter**: Do not hand-edit Cursor JSON in extension code for the initial release; delegate merge/overwrite behavior to `setup-cursor-mcp` so the CLI remains the tested owner of file semantics.
- **Content providers**: Read local repo metadata in development and published package metadata in production.

## VS Code API Surface

- **Commands**: Register command-palette actions for MCP setup, force setup, capability viewing, and opening docs.
- **Tree view**: Provide a lightweight Telnyx view with sections for MCP status, capabilities, skills, and guides.
- **Webview**: Defer rich webviews until needed. A tree view plus quick-pick flows should be enough for the first release.
- **Notifications**: Use VS Code notifications for setup success, conflict warnings, and malformed JSON errors. Include a secondary action for force overwrite.
- **Workspace trust**: Only write `.cursor/mcp.json` when the workspace is trusted and the user confirms the target folder.

## Authentication Flow

- MCP requests use Telnyx's hosted MCP server at `https://api.telnyx.com/v2/mcp` with Bearer auth from the Cursor runtime environment via `headers.Authorization: "Bearer ${env:TELNYX_API_KEY}"`.
- The extension should not collect API keys for MCP setup. It only writes the endpoint config and should instruct users to make `TELNYX_API_KEY` available to Cursor before starting MCP sessions.
- Any future account or provisioning action should reuse the Agent CLI's existing authentication lookup order (`TELNYX_API_KEY`, then `~/.config/telnyx/config.json`) and clearly disclose when credentials are required.
- If credential storage becomes necessary, use VS Code SecretStorage and document migration from CLI config separately.

## CLI Invocation Contract

The extension should treat `telnyx-agent setup-cursor-mcp` as the supported repo-local interface:

```bash
telnyx-agent setup-cursor-mcp --dir <workspace> --json
telnyx-agent setup-cursor-mcp --dir <workspace> --force --json
```

Expected JSON shape:

```json
{
  "ready": true,
  "path": "/path/to/project/.cursor/mcp.json",
  "action": "created",
  "config": {
    "mcpServers": {
      "telnyx": {
        "type": "http",
        "url": "https://api.telnyx.com/v2/mcp",
        "headers": {
          "Authorization": "Bearer ${env:TELNYX_API_KEY}"
        }
      }
    }
  }
}
```

The extension should branch on `action` values:

- `created` or `merged`: show success and the config path.
- `skipped` with `ready: true`: show already configured.
- `skipped` with a conflict detail: offer force overwrite.
- `error`: show the detail and do not retry automatically.

## Skills Installation

Do not reference internal skill sync tooling in user-facing extension flows. When documenting or offering skill installation, use the existing README-style command:

```bash
npx skills add team-telnyx/ai --skill <SKILL> --agent <AGENT>
```

The extension can render this as a copyable command or run it only after explicit user confirmation.

## Milestones

1. **Repo-local foundation**: Ship `telnyx-agent setup-cursor-mcp`, capability metadata, tests, and docs in this repo.
2. **Extension spike**: Prototype command registration, workspace detection, CLI invocation, and result handling in a private extension package.
3. **MCP setup UX**: Add command-palette and tree-view flows for configure/check/force setup.
4. **Skills and capability explorer**: Render skills, guides, and `capabilities --json` output without duplicating source data.
5. **Packaging decision**: Decide between `plugins/vscode/` in this monorepo and a standalone repository based on UI complexity and release needs.
6. **Marketplace readiness**: Add icon, publisher metadata, README, changelog, privacy notes, and Cursor/VS Code compatibility testing.

## How This Repo Should Reference the Extension

- Root `README.md`: Keep the Cursor section focused on the official plugin status and the CLI fallback.
- `cli/README.md`: Document the CLI command and JSON contract used by the extension.
- `agent.json` or capability metadata: Reference IDE integration actions such as `setup_cursor_mcp` for discoverability.
- Future extension repo/package: Link back to `team-telnyx/ai` as the canonical source for skills, guides, MCP URL, and CLI behavior.
