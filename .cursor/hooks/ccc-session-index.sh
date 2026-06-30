#!/bin/bash
# sessionStart — incremental ccc index when CocoIndex Code is initialized
set -euo pipefail

if ! command -v ccc >/dev/null 2>&1; then
  exit 0
fi

if [[ ! -d .cocoindex_code ]]; then
  exit 0
fi

ccc index >/dev/null 2>&1 || true
