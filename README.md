# no-style-plus

A feature-rich Jekyll blog template built on top of [riggraz/no-style-please](https://github.com/riggraz/no-style-please). Keeps the minimalist black-and-white aesthetic while adding a full set of blogging features as progressive enhancements.

**[Live Demo](https://your-demo-url.github.io)** · **[中文说明](#中文说明)**

---

## Features

| Feature | Detail |
|---------|--------|
| Dark mode | `filter: invert(1)` — no color-system rewrite required. Cycles auto / light / dark. |
| Client-side search | Full-text search over all posts. No plugin, no build step. Press `/` from any page. |
| Server-side math | LaTeX via [jektex](https://github.com/yagarea/jektex). Opt-in per post with `math: true`. |
| Comments | [Giscus](https://giscus.app) — opt-in per post with `comments: true`. |
| Reading time | Char count + estimated reading time (excludes code blocks). |
| Series navigation | Link related posts with `series: "name"` front-matter. |
| Table of contents | Auto-generated from `## headings`. Opt-in with `toc: true`. |
| Tufte sidenotes | Footnotes float to the right margin on wide screens (≥ 1100 px). |
| Callouts | GitHub-style `[!NOTE]` / `[!TIP]` / `[!WARNING]` / `[!CAUTION]` / `[!IMPORTANT]`. |
| Copy-code button | `[copy]` button on every code block. |
| Mermaid diagrams | Lazy-loaded from CDN only when a fenced `mermaid` block exists. |
| Image lightbox | Click any image to zoom. |
| Hover link previews | Hover internal post links to preview title + description. |
| Anchor links | `#` link on every heading, copies URL to clipboard. |
| Post navigation | Prev / next post links at the bottom of every post. |
| Related posts | Automatically suggests up to 4 related posts (series → category → tag). |
| Backlinks | Lists other posts that link to the current page. |
| Tag / category clouds | Weighted by post count. |
| GoatCounter analytics | Privacy-respecting, no cookies. Opt-in via `goat_counter` in `_config.yml`. |
| Stats page | Bar chart of most-visited posts from GoatCounter. |
| Post scaffolder | `python new_post.py` — interactive CLI to create posts with valid front-matter. |
| Keyboard navigation | `j`/`k` to navigate post lists, `/` to open search. |
| Accessibility | Skip-to-content link, `:focus-visible` outlines, `prefers-reduced-motion`. |
| Print styles | Cleans up chrome, expands link URLs, forces black-on-white. |

---

## Quick Start

**Option A — Use as a template (recommended)**

1. Click **"Use this template"** on GitHub to create your own repo.
2. Edit `_config.yml` — at minimum fill in `title`, `author`, `url`.
3. Enable GitHub Pages in your repo settings (Source: GitHub Actions).

**Option B — Clone and run locally**

```bash
git clone https://github.com/your-username/no-style-plus.git my-blog
cd my-blog
bundle install
bundle exec jekyll serve --livereload
# open http://localhost:4000
```

---

## Writing Posts

Use the interactive scaffolder to create a new post:

```bash
python new_post.py
```

Or use CLI flags for scripted creation:

```bash
python new_post.py \
  --title "My Post Title" \
  --slug my-post \
  --tags Python,tutorial \
  --math \
  --non-interactive
```

Run `python new_post.py --help` for all options.

### Front-matter reference

```yaml
---
layout: post
title: "Post Title"
date: 2026-01-01 12:00:00 +0000
categories: [tutorial]
tags: [Python, web]
author: "Your Name"
published: true
description: "One-line description shown in lists and SEO."
comments: true       # enable Giscus comments
toc: true            # auto table of contents
math: true           # enable LaTeX via jektex
series: "My Series"  # link posts in a series
---
```

---

## Configuration

Key settings in `_config.yml`:

```yaml
# Required
title: My Blog
author: Your Name
url: https://yoursite.com

# Analytics (optional)
goat_counter: yoursite   # from goatcounter.com

# Comments (optional — get IDs from https://giscus.app)
giscus:
  repo: "owner/repo"
  repo_id: ""
  category_id: ""

# Dark mode default: "auto" | "light" | "dark"
theme_config:
  appearance: "auto"

# Chinese mainland ICP compliance (optional)
# icp_code: ""
# gongan_code: ""
```

---

## Fonts

By default the theme loads:
- **LXGW WenKai Screen** (Chinese) from cdn.jsdelivr.net
- **Fira Code** (Latin / code) from cdn.jsdelivr.net

To use a self-hosted font instead, add an `@font-face` rule in `assets/css/main.scss` and remove the CDN `<link>` from `_includes/head.html`.

---

## Dark Mode

Dark mode works by applying `filter: invert(1) hue-rotate(180deg)` to `<body>`. This inverts the entire page.

**Images, logos, and embedded widgets** that must keep their original colors need `class="ioda"` to cancel the invert:

```html
<img src="photo.jpg" class="ioda" alt="...">
```

The Giscus iframe is handled automatically.

---

## Taxonomy

Add new categories and tags to `_data/taxonomy.yml` before using them. The scaffolder warns on unknown entries; CI fails on case mismatches across posts.

```yaml
categories:
  - tutorial
  - notes

tags:
  - Python
  - Linux
```

---

## Deployment

**GitHub Pages**: push to `main` — the included workflow deploys automatically.

**Self-hosted**: copy `deploy/post-receive.example` to your bare repo's `hooks/post-receive`, adjust paths, and make it executable.

---

## CI

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `jekyll-gh-pages.yml` | push to `main` | Build and deploy to GitHub Pages |
| `lint.yml` | push / PR to `main` | Validate front-matter schema |
| `link-check.yml` | weekly (Monday 03:00 UTC) | Check for broken links (non-blocking) |

---

## 中文说明

### 这是什么

no-style-plus 是基于 [no-style-please](https://github.com/riggraz/no-style-please) 主题的 Jekyll 博客模板。保留极简黑白风格，在此基础上追加了完整的博客功能集。

### 快速开始

1. 点击 GitHub 上的 **"Use this template"** 创建自己的仓库
2. 修改 `_config.yml`，至少填写 `title`、`author`、`url`
3. 在仓库设置中开启 GitHub Pages（Source: GitHub Actions）

### 创建文章

```bash
python new_post.py          # 交互式
python new_post.py --help   # 查看所有参数
```

### 功能开关

| 功能 | 开启方式 |
|------|---------|
| 评论 | 文章 front-matter 加 `comments: true` |
| 目录 | 文章 front-matter 加 `toc: true` |
| 数学公式 | 文章 front-matter 加 `math: true` |
| 系列导航 | 多篇文章加相同的 `series: "系列名"` |
| 暗色模式 | 右上角切换按钮，或修改 `_config.yml` 中 `appearance` |
| 统计 | `_config.yml` 填写 `goat_counter: yoursite` |
| 评论系统 | `_config.yml` 填写 `giscus.repo_id` 和 `category_id`（从 giscus.app 获取）|

### 注意事项

- 不应该被暗色模式反转的图片（如截图、logo），添加 `class="ioda"`
- 添加新的分类/标签前，先在 `_data/taxonomy.yml` 中登记
- 正文中文与代码混排是该主题的设计初衷，字体配置开箱即用

---

## Contributing

Issues and PRs welcome. Before adding a feature, check if it can be done with front-matter or a small JS module — keep the core minimal.

## License

MIT — see [LICENSE](LICENSE).
