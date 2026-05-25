---
layout: post
title: "Callouts and Sidenotes"
date: 2026-01-04 10:00:00 +0000
categories: [tutorial]
tags: [web]
author: "demo"
published: true
description: "GitHub-style callouts and Tufte-style sidenotes."
comments: false
toc: true
---

## Callouts

Write callouts using the GitHub-style `[!TYPE]` syntax inside a blockquote:

```markdown
> [!NOTE]
> Helpful information.

> [!TIP]
> A useful tip.

> [!WARNING]
> Something to watch out for.

> [!CAUTION]
> Dangerous action ahead.

> [!IMPORTANT]
> Critical information.
```

This renders as:

> [!NOTE]
> Helpful information that users should know, even when skimming.

> [!TIP]
> Optional tips for doing things better or more easily.

> [!WARNING]
> Something that could cause problems if ignored.

> [!CAUTION]
> Negative potential consequences of an action. Use sparingly.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

## Sidenotes

Sidenotes are Tufte-style footnotes that appear in the right margin on wide screens (≥ 1100 px). On narrow screens they fall back to standard numbered footnotes at the bottom of the post.

Use standard kramdown footnote syntax[^1] and they become sidenotes automatically.

Here is a second note[^2] to show that multiple sidenotes work independently.

[^1]: This is the first sidenote. It appears to the right of the paragraph on wide screens.

[^2]: This is the second sidenote. Each sidenote is anchored next to its inline marker.
