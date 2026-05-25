#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jekyll post scaffolder — cross-platform (Windows / Linux / macOS)

Usage:
  python new_post.py                                     # interactive
  python new_post.py --title "My Post" --slug my-post   # partially pre-filled
  python new_post.py --title "x" --slug y --non-interactive --tags a,b   # fully scripted
"""

import argparse
import os
import sys
import re
from datetime import datetime


# ============ Config ============
POSTS_DIR = ""          # leave blank → uses _posts/ next to this script
DEFAULT_AUTHOR = ""     # default author name (leave blank to always prompt)
DEFAULT_CATEGORIES = []
DEFAULT_TAGS = []
TAXONOMY_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "_data", "taxonomy.yml"
)
# ================================


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug (preserves CJK characters)."""
    text = text.strip()
    text = re.sub(r'[\s/\\:*?"<>|]+', '-', text)
    text = text.strip('-')
    return text


def parse_list_input(raw: str) -> list:
    """Parse comma/space/Chinese-comma separated list."""
    if not raw.strip():
        return []
    items = re.split(r'[,，\s]+', raw.strip())
    return [item.strip() for item in items if item.strip()]


def load_taxonomy():
    """Read _data/taxonomy.yml. Returns (cats_map, tags_map) where each map
    is {lowercase: canonical}. Returns (None, None) on any failure."""
    if not os.path.exists(TAXONOMY_FILE):
        return None, None
    try:
        import yaml  # type: ignore
    except ImportError:
        print("⚠ pyyaml not found — taxonomy normalisation skipped (pip install pyyaml)",
              file=sys.stderr)
        return None, None
    try:
        with open(TAXONOMY_FILE, encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
    except Exception as e:
        print(f"⚠ Could not read {TAXONOMY_FILE}: {e}", file=sys.stderr)
        return None, None
    cats = {c.lower(): c for c in (data.get("categories") or []) if isinstance(c, str)}
    tags = {t.lower(): t for t in (data.get("tags") or []) if isinstance(t, str)}
    return cats, tags


def normalize_via_taxonomy(values, canonical_map, kind):
    """Look up each value in canonical_map; fix casing and warn about unknowns."""
    if not canonical_map:
        return values
    out = []
    for v in values:
        key = v.lower()
        if key in canonical_map:
            canonical = canonical_map[key]
            if canonical != v:
                print(f"  -> {kind} normalised: \"{v}\" -> \"{canonical}\"")
            out.append(canonical)
        else:
            print(f"  [!] {kind} \"{v}\" is not in _data/taxonomy.yml. "
                  f"Remember to add it if this is a new entry.")
            out.append(v)
    return out


def prompt_input(prompt_text: str, default: str = "") -> str:
    display = f"{prompt_text} [{default}]: " if default else f"{prompt_text}: "
    value = input(display).strip()
    return value if value else default


def prompt_bool(prompt_text: str, default: bool = True) -> bool:
    hint = "Y/n" if default else "y/N"
    value = input(f"{prompt_text} [{hint}]: ").strip().lower()
    if not value:
        return default
    return value in ('y', 'yes')


def get_posts_dir(non_interactive: bool = False) -> str:
    if POSTS_DIR:
        posts_path = os.path.abspath(POSTS_DIR)
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        posts_path = os.path.join(script_dir, "_posts")

    if not os.path.exists(posts_path):
        if non_interactive:
            os.makedirs(posts_path, exist_ok=True)
            print(f"✔ Created directory: {posts_path}")
        else:
            create = prompt_bool(f"Directory {posts_path} does not exist — create it?", default=True)
            if create:
                os.makedirs(posts_path, exist_ok=True)
                print(f"✔ Created directory: {posts_path}")
            else:
                print("Cancelled.")
                sys.exit(0)

    return posts_path


def parse_args():
    p = argparse.ArgumentParser(
        description="Jekyll post scaffolder (interactive by default)",
        epilog="Any field not provided on the CLI is prompted for, "
               "unless --non-interactive is set.",
    )
    p.add_argument('--title', help='Post title')
    p.add_argument('--slug', help='Filename slug (ASCII)')
    p.add_argument('--date', help='Publish date YYYY-MM-DD (default: today)')
    p.add_argument('--categories', help='Categories, comma-separated')
    p.add_argument('--tags', help='Tags, comma-separated')
    p.add_argument('--series', help='Series name')
    p.add_argument('--author', help=f'Author (default: {DEFAULT_AUTHOR or "prompted"})')
    p.add_argument('--description', help='Post description')
    p.add_argument('--image', help='Header image path')
    p.add_argument('--permalink', help='Custom permalink')
    p.add_argument('--draft', action='store_true', help='Set published: false')
    p.add_argument('--no-comments', dest='no_comments', action='store_true',
                   help='Disable comments (default: enabled)')
    p.add_argument('--toc', action='store_true', help='Enable table of contents')
    p.add_argument('--math', action='store_true', help='Enable LaTeX math')
    p.add_argument('--non-interactive', dest='non_interactive', action='store_true',
                   help='Skip all prompts; fail if a required field is missing')
    p.add_argument('--force', action='store_true', help='Overwrite if file exists')
    return p.parse_args()


def _resolve_text(args_value, prompt_text, default, non_interactive, *, required=False):
    if args_value is not None:
        return args_value
    if non_interactive:
        if required:
            print(f"❌ Missing required field: {prompt_text}", file=sys.stderr)
            sys.exit(1)
        return default
    if required:
        v = ""
        while not v:
            v = input(f"{prompt_text}: ").strip()
            if not v:
                print("⚠ This field is required.")
        return v
    return prompt_input(prompt_text, default)


def _resolve_bool(flag_set, prompt_text, default, non_interactive):
    if flag_set:
        return True
    if non_interactive:
        return default
    return prompt_bool(prompt_text, default=default)


def generate_post(args):
    ni = args.non_interactive
    any_cli = any([args.title, args.slug, args.date, args.categories, args.tags,
                   args.series, args.author, args.description, args.image,
                   args.permalink, args.draft, args.no_comments, args.toc, args.math])

    cats_canonical, tags_canonical = load_taxonomy()

    if not any_cli and not ni:
        print("=" * 50)
        print("  Jekyll Post Scaffolder")
        print("=" * 50)
        print()

    title = _resolve_text(args.title, "Post title (required)", "", ni, required=True)
    filename_slug = _resolve_text(
        args.slug, "Filename slug (ASCII, required)", "", ni, required=True)

    now = datetime.now()
    default_date = now.strftime("%Y-%m-%d")
    date_str = _resolve_text(args.date, "Publish date", default_date, ni)
    try:
        post_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        print(f"⚠ Invalid date format, using today: {default_date}")
        post_date = now
        date_str = default_date
    full_datetime = post_date.strftime("%Y-%m-%d") + now.strftime(" %H:%M:%S +0000")

    default_cats = ", ".join(DEFAULT_CATEGORIES) if DEFAULT_CATEGORIES else ""
    cats_label = "Categories (comma-separated)"
    if cats_canonical:
        cats_label = f"Categories (existing: {', '.join(sorted(cats_canonical.values()))})"
    cats_raw = _resolve_text(args.categories, cats_label, default_cats, ni)
    categories = parse_list_input(cats_raw)
    categories = normalize_via_taxonomy(categories, cats_canonical, "category")

    default_tags_str = ", ".join(DEFAULT_TAGS) if DEFAULT_TAGS else ""
    tags_label = "Tags (comma-separated)"
    if tags_canonical:
        tags_label = f"Tags (existing: {', '.join(sorted(tags_canonical.values()))})"
    tags_raw = _resolve_text(args.tags, tags_label, default_tags_str, ni)
    tags = parse_list_input(tags_raw)
    tags = normalize_via_taxonomy(tags, tags_canonical, "tag")

    series = _resolve_text(args.series, "Series name (optional)", "", ni)
    author = _resolve_text(args.author, "Author", DEFAULT_AUTHOR, ni)
    description = _resolve_text(args.description, "Description (optional)", "", ni)
    image = _resolve_text(args.image, "Header image path (optional)", "", ni)
    permalink = _resolve_text(args.permalink, "Custom permalink (optional)", "", ni)

    published = not args.draft if (args.draft or ni) else prompt_bool("Publish immediately?", default=True)
    comments = False if args.no_comments else (
        True if ni else prompt_bool("Enable comments?", default=True))
    toc = _resolve_bool(args.toc, "Enable table of contents?", default=False, non_interactive=ni)
    math = _resolve_bool(args.math, "Enable LaTeX math?", default=False, non_interactive=ni)

    slug = slugify(filename_slug)
    filename = f"{date_str}-{slug}.md"

    front_matter_lines = [
        "---",
        "layout: post",
        f'title: "{title}"',
        f"date: {full_datetime}",
        f"categories: [{', '.join(categories)}]",
        f"tags: [{', '.join(tags)}]",
    ]
    if permalink:
        front_matter_lines.append(f"permalink: {permalink}")
    if series:
        front_matter_lines.append(f'series: "{series}"')
    front_matter_lines.append(f'author: "{author}"')
    front_matter_lines.append(f"published: {'true' if published else 'false'}")
    front_matter_lines.append(f'description: "{description}"')
    if image:
        front_matter_lines.append(f'image: "{image}"')
    front_matter_lines.append(f"comments: {'true' if comments else 'false'}")
    front_matter_lines.append(f"toc: {'true' if toc else 'false'}")
    if math:
        front_matter_lines.append("math: true")
    front_matter_lines.append("---")

    full_content = "\n".join(front_matter_lines) + "\n"

    posts_dir = get_posts_dir(non_interactive=ni)
    filepath = os.path.join(posts_dir, filename)

    if os.path.exists(filepath) and not args.force:
        if ni:
            print(f"❌ File exists: {filename} (use --force to overwrite)", file=sys.stderr)
            sys.exit(1)
        overwrite = prompt_bool(f"⚠ {filename} already exists — overwrite?", default=False)
        if not overwrite:
            print("Cancelled.")
            return

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_content)

    print()
    print("=" * 50)
    print(f"✔ Post created: {filepath}")
    print("=" * 50)

    if not ni:
        print("\n--- Front matter preview ---")
        for line in front_matter_lines:
            print(line)
        print()


def main():
    try:
        args = parse_args()
        generate_post(args)
    except KeyboardInterrupt:
        print("\n\nCancelled.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
