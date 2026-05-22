# Voice Benchmark Harness

This directory stores machine-readable benchmark artifacts for the paved-road Telnyx voice AI flow.

## Run

From the repo root:

```sh
node scripts/export-voice-benchmark-artifact.mjs \
  --conversation-id <telnyx-conversation-id> \
  --usage-date YYYY-MM-DD \
  --output artifacts/voice-benchmark/YYYY-MM-DD-<conversation-suffix>.json
```

The exporter reads the Telnyx API key from `TELNYX_API_KEY` first, then falls back to `~/.config/telnyx/config.json`.

## Output

Each artifact is JSON and includes:

- latency summary from assistant turn metadata
- transcript-quality counts and insight-derived assessment
- interruption-handling evidence, including explicit `not_observed` when a live sample does not expose interruption markers
- provider-cost rows from Telnyx usage reports

Artifacts are written to `artifacts/voice-benchmark/`.

## Sample

- `2026-03-06-07429dd8.json`: live phone-call sample exported from conversation `07429dd8-57ba-42f5-a45d-907288f6ef5d`
