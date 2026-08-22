#!/usr/bin/env python3
"""Rewrite used image URLs/imports in src/ to .webp (does not touch originals on disk)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
LIST = ROOT / "scripts" / "used-images.txt"

TEXT_EXTS = {".astro", ".ts", ".js", ".css"}
RASTER = re.compile(r"\.(png|jpe?g)$", re.I)


def to_webp(s: str) -> str:
    return RASTER.sub(".webp", s)


def load_full_paths_and_basenames() -> tuple[list[str], list[str], list[str]]:
    full: list[str] = []
    names: list[str] = []
    assets: list[str] = []
    seen_full: set[str] = set()
    seen_names: set[str] = set()

    def add_full(old: str) -> None:
        if old in seen_full or not RASTER.search(old):
            return
        seen_full.add(old)
        full.append(old)

    def add_name(old: str) -> None:
        if old in seen_names or not RASTER.search(old):
            return
        seen_names.add(old)
        names.append(old)

    for line in LIST.read_text().splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        url, _src = line.split("\t", 1)
        if url.startswith("ASSET:"):
            name = url[6:]
            assets.append(name)
        else:
            add_full(url)
            add_name(url.rsplit("/", 1)[-1])

    extra = [
        "/rover/grandrover/21.6/216.png",
        "/rover/grandrover/21.6/interior.png",
        "/rover/grandrover/21.6/interior1.png",
        "/rover/grandrover/21.6/interior2.png",
        "/rover/grandrover/21.6/interior3.png",
        "/drifter/amore/amor.png",
        "/3D LAYOUTS 2024/3D LAYOUT NEW UPDATED AUG 2025/GTH ATOM 17.6.png",
        "/3D LAYOUTS 2024/3D LAYOUT NEW UPDATED AUG 2025/WILD DRIFTER 19.6.png",
    ]
    for u in extra:
        add_full(u)

    full.sort(key=len, reverse=True)
    names.sort(key=len, reverse=True)
    return full, names, assets


def should_process(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_EXTS:
        return False
    try:
        rel = path.relative_to(SRC)
    except ValueError:
        return False
    return "admin" not in rel.parts


def rewrite_text(text: str, full: list[str], names: list[str], assets: list[str]) -> str:
    for old in full:
        text = text.replace(old, to_webp(old))
    for name in assets:
        text = text.replace(f"../assets/{name}", f"../assets/{to_webp(name)}")
        text = text.replace(f"../../assets/{name}", f"../../assets/{to_webp(name)}")
    # Quoted complete filenames only (avoids IMG_6981.jpg vs 1.jpg)
    for name in names:
        if name.startswith("/"):
            continue
        new = to_webp(name)
        if name == new:
            continue
        escaped = re.escape(name)
        text = re.sub(rf"(['\"`]){escaped}\1", rf"\g<1>{new}\g<1>", text)
    return text


def main() -> None:
    full, names, assets = load_full_paths_and_basenames()
    files_changed = 0
    for path in SRC.rglob("*"):
        if not path.is_file() or not should_process(path):
            continue
        orig = path.read_text(encoding="utf-8")
        text = rewrite_text(orig, full, names, assets)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            files_changed += 1
            print(f"updated {path.relative_to(ROOT)}")
    print(f"files_changed={files_changed}")


if __name__ == "__main__":
    main()
