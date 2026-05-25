#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validate _posts/*.md front-matter against the schema enforced by new_post.py.

Exits non-zero if any post violates the schema. Run from the repo root:

    python scripts/check_frontmatter.py
"""

import os
import re
import sys
from datetime import datetime

try:
    import yaml
except ImportError:
    print("[FAIL] pyyaml not installed: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

REQUIRED_KEYS = {"layout", "title", "date", "categories", "tags"}
OPTIONAL_KEYS = {
    "author", "published", "description", "image", "permalink",
    "comments", "toc", "math", "series", "last_modified_at",
}
ALLOWED_KEYS = REQUIRED_KEYS | OPTIONAL_KEYS

ALLOWED_LAYOUTS = {"post"}

POSTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_posts")
POSTS_DIR = os.path.abspath(POSTS_DIR)

FILENAME_RE = re.compile(r"^(\d{4}-\d{1,2}-\d{1,2})-.+\.md$")
FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def check_post(path: str) -> list[str]:
    problems = []
    name = os.path.basename(path)

    m = FILENAME_RE.match(name)
    if not m:
        problems.append(f"filename must match YYYY-MM-DD-slug.md")
    else:
        try:
            datetime.strptime(m.group(1), "%Y-%m-%d")
        except ValueError:
            problems.append(f"filename date '{m.group(1)}' is not a real date")

    with open(path, encoding="utf-8") as f:
        text = f.read()
    fm_match = FRONT_MATTER_RE.match(text)
    if not fm_match:
        problems.append("no front-matter block")
        return problems

    try:
        fm = yaml.safe_load(fm_match.group(1)) or {}
    except yaml.YAMLError as e:
        problems.append(f"front-matter is not valid YAML: {e}")
        return problems

    if not isinstance(fm, dict):
        problems.append("front-matter is not a mapping")
        return problems

    missing = REQUIRED_KEYS - fm.keys()
    if missing:
        problems.append(f"missing required keys: {', '.join(sorted(missing))}")

    unknown = fm.keys() - ALLOWED_KEYS
    if unknown:
        problems.append(f"unknown keys: {', '.join(sorted(unknown))}")

    if fm.get("layout") not in ALLOWED_LAYOUTS:
        problems.append(f"layout must be one of {ALLOWED_LAYOUTS}, got {fm.get('layout')!r}")

    date = fm.get("date")
    if date is not None and not isinstance(date, (str, datetime)):
        problems.append(f"date must be a string or datetime, got {type(date).__name__}")

    lma = fm.get("last_modified_at")
    if lma is not None and not isinstance(lma, (str, datetime)):
        problems.append(
            f"last_modified_at must be a string or datetime, "
            f"got {type(lma).__name__}"
        )

    for k in ("categories", "tags"):
        v = fm.get(k)
        if v is not None and not isinstance(v, list):
            problems.append(f"{k} must be a list, got {type(v).__name__}")

    for k in ("published", "comments", "toc", "math"):
        v = fm.get(k)
        if v is not None and not isinstance(v, bool):
            problems.append(f"{k} must be a bool, got {type(v).__name__}")

    return problems


def collect_taxonomy(posts_dir: str) -> dict:
    """Return {kind: {lowercase: set(of casings used)}} across all posts.
    Used to detect when the same logical tag/category is recorded with two
    different casings (Jekyll archives them separately, breaking discovery)."""
    seen = {"tags": {}, "categories": {}}
    for name in sorted(os.listdir(posts_dir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(posts_dir, name)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        m = FRONT_MATTER_RE.match(text)
        if not m:
            continue
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except yaml.YAMLError:
            continue
        if not isinstance(fm, dict):
            continue
        for kind in ("tags", "categories"):
            values = fm.get(kind) or []
            if not isinstance(values, list):
                continue
            for v in values:
                if not isinstance(v, str):
                    continue
                seen[kind].setdefault(v.lower(), set()).add(v)
    return seen


def find_case_duplicates(posts_dir: str) -> list[str]:
    """Return human-readable problem strings for any tag/category whose
    lowercase form maps to more than one verbatim casing across posts."""
    problems = []
    seen = collect_taxonomy(posts_dir)
    for kind, mapping in seen.items():
        for key, casings in sorted(mapping.items()):
            if len(casings) > 1:
                listed = ", ".join(sorted(repr(c) for c in casings))
                problems.append(
                    f"{kind} \"{key}\" appears with {len(casings)} casings "
                    f"across posts: {listed}. Pick one canonical form and "
                    f"normalize all posts (see _data/taxonomy.yml)."
                )
    return problems


def main() -> int:
    if not os.path.isdir(POSTS_DIR):
        print(f"[FAIL] _posts directory not found: {POSTS_DIR}", file=sys.stderr)
        return 2

    posts = sorted(f for f in os.listdir(POSTS_DIR) if f.endswith(".md"))
    if not posts:
        print("no posts to check")
        return 0

    total_problems = 0
    for name in posts:
        path = os.path.join(POSTS_DIR, name)
        problems = check_post(path)
        if problems:
            total_problems += len(problems)
            print(f"[FAIL] {name}")
            for p in problems:
                print(f"    - {p}")
        else:
            print(f"[OK] {name}")

    cross_problems = find_case_duplicates(POSTS_DIR)
    if cross_problems:
        total_problems += len(cross_problems)
        print()
        print("[FAIL] cross-post taxonomy")
        for p in cross_problems:
            print(f"    - {p}")

    print()
    if total_problems:
        print(f"FAIL: {total_problems} problem(s) in {len(posts)} post(s)")
        return 1
    print(f"OK: {len(posts)} post(s) valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
