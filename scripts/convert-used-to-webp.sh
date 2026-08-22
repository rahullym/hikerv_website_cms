#!/usr/bin/env bash
# Convert used raster images (listed in used-images.txt) to sibling .webp files.
# Originals are kept. Skips when .webp exists and is newer than the source.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIST="$ROOT/scripts/used-images.txt"

if [[ ! -f "$LIST" ]]; then
  echo "Missing $LIST" >&2
  exit 1
fi

is_logo() {
  local rel="$1"
  case "$rel" in
    *featuredlogos/*|*/gethitched.png|*/hikerv.png) return 0 ;;
    *) return 1 ;;
  esac
}

converted=0
skipped=0
missing=0
before_bytes=0
after_bytes=0

echo "=== convert used images → webp ==="
echo

while IFS=$'\t' read -r url src || [[ -n "${url:-}" ]]; do
  [[ -z "${url:-}" || "$url" =~ ^# ]] && continue

  if [[ ! -f "$src" ]]; then
    # Already replaced by webp-only file (no original left)
    webp_only="${src%.*}.webp"
    if [[ -f "$webp_only" ]]; then
      echo "SKIP (webp exists, original gone)  $url"
      skipped=$((skipped + 1))
      continue
    fi
    echo "MISS  $url"
    missing=$((missing + 1))
    continue
  fi

  dest="${src%.*}.webp"
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "SKIP (up to date)  $url"
    skipped=$((skipped + 1))
    continue
  fi

  quality=80
  if is_logo "$url"; then
    quality=90
  fi

  magick "$src" -strip -quality "$quality" "$dest"

  b=$(stat -c%s "$src")
  a=$(stat -c%s "$dest")
  before_bytes=$((before_bytes + b))
  after_bytes=$((after_bytes + a))
  converted=$((converted + 1))
  printf "OK q=%s  %6.2f MB → %6.2f MB  %s\n" \
    "$quality" \
    "$(awk -v n="$b" 'BEGIN{printf "%.2f", n/1048576}')" \
    "$(awk -v n="$a" 'BEGIN{printf "%.2f", n/1048576}')" \
    "$url"
done < "$LIST"

echo
echo "converted=$converted skipped=$skipped missing=$missing"
if [[ $before_bytes -gt 0 ]]; then
  awk -v b="$before_bytes" -v a="$after_bytes" 'BEGIN{
    printf "this-run originals: %.1f MB → webp: %.1f MB (%.0f%% of original)\n",
      b/1048576, a/1048576, (a/b)*100
  }'
fi
