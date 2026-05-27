---
layout: post
title: "Series Navigation (Part 1)"
date: 2026-01-06 10:00:00 +0000
categories: [tutorial]
tags: [web]
author: "demo"
published: true
description: "First post in a demo series. Shows the series navigation box."
comments: false
toc: false
series: "Demo Series"
---

This is the first post in the **Demo Series**. When two or more posts share the same `series:` value, a navigation box appears at the top of each post listing all posts in the series and marking the current one.

To create a series, add the same `series: "name"` to every post that belongs to it:

```yaml
series: "Demo Series"
```

The navigation box is rendered by `_includes/series_nav.html` and appears automatically once at least two posts share the series name.

The series navigation box at the top of this page links to Part 2.
