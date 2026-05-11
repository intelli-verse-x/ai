#!/bin/bash
# Validates that every canonical skill has a non-empty description in frontmatter.
# Exit 1 if any skill is missing a description or has an empty one.
#
# Usage:
#   ./scripts/check-skill-descriptions.sh [--json]
#
# --json: Output machine-readable JSON report instead of human-readable text.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_SRC="$REPO_ROOT/skills"
JSON_MODE=false

if [[ "${1:-}" == "--json" ]]; then
  JSON_MODE=true
fi

if [[ ! -d "$SKILLS_SRC" ]]; then
  echo "ERROR: skills/ directory not found at $SKILLS_SRC" >&2
  exit 1
fi

missing=()
empty=()
valid=()
total=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name=$(basename "$skill_dir")
  skill_file="$skill_dir/SKILL.md"

  if [[ ! -f "$skill_file" ]]; then
    continue
  fi

  total=$((total + 1))

  # Extract the description line from YAML frontmatter
  # Frontmatter is between --- delimiters
  desc_line=$(awk '/^---$/{n++; next} n==1 && /^description:/{print; exit}' "$skill_file")

  if [[ -z "$desc_line" ]]; then
    missing+=("$skill_name")
    continue
  fi

  # Extract value after "description:" and trim whitespace
  desc_value=$(echo "$desc_line" | sed 's/^description:[[:space:]]*//' | sed 's/^"//' | sed 's/"$//')

  if [[ -z "$desc_value" ]]; then
    empty+=("$skill_name")
    continue
  fi

  valid+=("$skill_name")
done

if $JSON_MODE; then
  # Output JSON report
  printf '{"total":%d,"valid":%d,"missing":%d,"empty":%d,"missing_list":[' "$total" "${#valid[@]}" "${#missing[@]}" "${#empty[@]}"
  first=true
  for s in "${missing[@]}"; do
    $first || printf ','
    printf '"%s"' "$s"
    first=false
  done
  printf '],"empty_list":['
  first=true
  for s in "${empty[@]}"; do
    $first || printf ','
    printf '"%s"' "$s"
    first=false
  done
  printf ']}\n'
else
  echo "Skill description audit: $total skills checked"
  echo "  Valid:     ${#valid[@]}"
  echo "  Missing:   ${#missing[@]}"
  echo "  Empty:     ${#empty[@]}"

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo ""
    echo "MISSING description frontmatter:"
    for s in "${missing[@]}"; do
      echo "  - $s"
    done
  fi

  if [[ ${#empty[@]} -gt 0 ]]; then
    echo ""
    echo "EMPTY description frontmatter:"
    for s in "${empty[@]}"; do
      echo "  - $s"
    done
  fi
fi

if [[ ${#missing[@]} -gt 0 || ${#empty[@]} -gt 0 ]]; then
  exit 1
fi

echo ""
echo "All $total skills have non-empty descriptions. ✅"
exit 0
