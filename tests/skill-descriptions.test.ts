/**
 * Validates that every canonical skill under skills/ has a non-empty
 * description in YAML frontmatter. This is the regression check for
 * AIF-194 / GitHub #112 — ensuring no skill ships without a description
 * on agent/tool discovery surfaces.
 *
 * No API key needed — validates skill frontmatter structure only.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = typeof import.meta.dirname === "string"
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");

/**
 * Parse the YAML frontmatter from a SKILL.md file and extract the description.
 * Returns null if no description found, empty string if description is present but empty.
 */
function extractDescription(content: string): string | null {
  const lines = content.split("\n");
  let inFrontmatter = false;
  let frontmatterDelimiters = 0;

  for (const line of lines) {
    if (line.trim() === "---") {
      frontmatterDelimiters++;
      inFrontmatter = frontmatterDelimiters === 1;
      if (frontmatterDelimiters === 2) break; // end of frontmatter
      continue;
    }

    if (inFrontmatter && line.startsWith("description:")) {
      const value = line.slice("description:".length).trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1).trim();
      }
      return value;
    }
  }

  return null; // No description key found
}

function getCanonicalSkills(): string[] {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

describe("Skill descriptions", () => {
  it("every canonical skill should have a non-empty description in frontmatter", () => {
    const skills = getCanonicalSkills();
    assert.ok(skills.length > 0, "No canonical skills found — skills/ directory empty or missing");

    const missing: string[] = [];
    const empty: string[] = [];

    for (const skillName of skills) {
      const skillPath = join(SKILLS_DIR, skillName, "SKILL.md");
      if (!existsSync(skillPath)) continue;

      const content = readFileSync(skillPath, "utf-8");
      const desc = extractDescription(content);

      if (desc === null) {
        missing.push(skillName);
      } else if (desc.length === 0) {
        empty.push(skillName);
      }
    }

    const errors: string[] = [];
    if (missing.length > 0) {
      errors.push(`Missing description: ${missing.join(", ")}`);
    }
    if (empty.length > 0) {
      errors.push(`Empty description: ${empty.join(", ")}`);
    }

    assert.strictEqual(errors.length, 0, errors.join("; "));
  });

  it("skill count should be stable (234 canonical skills)", () => {
    const skills = getCanonicalSkills();
    assert.ok(skills.length >= 234, `Expected at least 234 skills, found ${skills.length}`);
  });
});
