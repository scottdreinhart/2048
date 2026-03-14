#!/usr/bin/env bash
# check-input-controls.sh
#
# Validates input-controls governance (see .github/instructions/08-input-controls.instructions.md):
#   1. No raw document/window key listeners in src/ui/ (must go through useKeyboardControls)
#   2. useKeyboardControls must not be re-implemented inside src/ui/ (belongs in src/app/)

set -euo pipefail

VIOLATIONS=0
SRC_UI="src/ui"

if [[ ! -d "$SRC_UI" ]]; then
  echo "src/ui/ not found — skipping input controls check."
  exit 0
fi

echo "==> Checking for raw key listeners in $SRC_UI/ ..."

while IFS= read -r -d '' file; do
  matches=$(grep -nP "(?:document|window)\.addEventListener\s*\(\s*['\"]key" "$file" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    echo "  FAIL  $file"
    echo "$matches" | sed 's/^/        /'
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done < <(find "$SRC_UI" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)

echo "==> Checking for useKeyboardControls re-definition in $SRC_UI/ ..."

while IFS= read -r -d '' file; do
  matches=$(grep -nP "(?:export\s+(?:default\s+)?(?:function|const)|^function|^const)\s+useKeyboardControls\b" "$file" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    echo "  FAIL  $file — useKeyboardControls must live in src/app/, not src/ui/"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done < <(find "$SRC_UI" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)

echo ""
if [[ $VIOLATIONS -gt 0 ]]; then
  echo "Input controls check FAILED: $VIOLATIONS violation(s)."
  echo "Governance: .github/instructions/08-input-controls.instructions.md"
  exit 1
else
  echo "Input controls check passed (0 violations)."
fi
