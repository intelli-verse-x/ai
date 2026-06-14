import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseOkfConceptMarkdown, validateOkfBundle } from "../src/okf/index.js";

test("parses OKF concept frontmatter, links, and citations", () => {
  const concept = parseOkfConceptMarkdown(`---
type: API Endpoint
title: Create Customer
description: Creates a customer record.
resource: https://api.example.com/customers
method: POST
tags: [api, customers]
timestamp: 2026-06-13T00:00:00Z
---
# Request

Accepts a [Customer schema](/schemas/customer.md).

# Citations

[1] [OpenAPI source](https://api.example.com/openapi.json)
`, "endpoints/create-customer.md");

  assert.equal(concept.id, "endpoints/create-customer");
  assert.equal(concept.type, "API Endpoint");
  assert.equal(concept.title, "Create Customer");
  assert.deepEqual(concept.tags, ["api", "customers"]);
  assert.equal(concept.frontmatter.method, "POST");
  assert.equal(concept.links.length, 2);
  assert.equal(concept.citations.length, 1);
});

test("validates OKF bundles permissively with warnings for broken links", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "link-okf-"));
  try {
    await mkdir(path.join(dir, "endpoints"), { recursive: true });
    await mkdir(path.join(dir, "schemas"), { recursive: true });
    await writeFile(path.join(dir, "index.md"), "# API\n\n* [Create Customer](endpoints/create-customer.md)\n");
    await writeFile(path.join(dir, "log.md"), "# Updates\n\n## 2026-06-13\n* **Creation**: Initial bundle.\n");
    await writeFile(
      path.join(dir, "endpoints/create-customer.md"),
      `---
type: API Endpoint
title: Create Customer
description: Creates a customer record.
tags:
  - api
  - customers
---
Uses [Customer](/schemas/customer.md) and [Missing](/schemas/missing.md).
`,
    );
    await writeFile(
      path.join(dir, "schemas/customer.md"),
      `---
type: Schema
title: Customer
---
Customer payload fields.
`,
    );

    const result = await validateOkfBundle(dir);
    assert.equal(result.errors.length, 0);
    assert.equal(result.summary.conceptCount, 2);
    assert.equal(result.summary.typeCounts["API Endpoint"], 1);
    assert.equal(result.summary.linkedConceptCount, 1);
    assert.equal(result.summary.brokenLinkCount, 1);
    assert.ok(result.warnings.some((warning) => warning.includes("/schemas/missing.md")));
    assert.equal(result.concepts[0]?.links[0]?.targetConceptId, "schemas/customer");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("invalid OKF concept frontmatter is a hard validation error", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "link-okf-invalid-"));
  try {
    await writeFile(path.join(dir, "broken.md"), "---\ntitle: Broken\n---\nNo type.\n");
    const result = await validateOkfBundle(dir);
    assert.equal(result.concepts.length, 0);
    assert.match(result.errors[0] ?? "", /missing required frontmatter: type/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
