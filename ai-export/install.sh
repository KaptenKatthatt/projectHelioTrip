#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: ./ai-export/install.sh /path/to/target-project"
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$1"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Target directory does not exist: $TARGET_DIR"
  exit 1
fi

echo "Copying template files..."
cp -R "$SOURCE_DIR/template/." "$TARGET_DIR/"

echo "Copying quality-gates guide..."
mkdir -p "$TARGET_DIR/ai-export"
cp -R "$SOURCE_DIR/quality-gates" "$TARGET_DIR/ai-export/"
cp "$SOURCE_DIR/README.md" "$TARGET_DIR/ai-export/README.md"
cp "$SOURCE_DIR/manifest.json" "$TARGET_DIR/ai-export/manifest.json" 2>/dev/null || true

echo "Done."
echo "Next steps:"
echo "1) Open $TARGET_DIR/context/AGENTS_CONTEXT.md"
echo "2) Apply updates from $TARGET_DIR/CUSTOMIZE_BEFORE_USE.md"
echo "3) Run verification commands: npx tsc --noEmit && npm run lint"
