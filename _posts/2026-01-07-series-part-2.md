---
layout: post
title: "Series Navigation (Part 2)"
date: 2026-01-07 10:00:00 +0000
categories: [tutorial]
tags: [web]
author: "demo"
published: true
description: "Second post in the demo series."
comments: false
toc: false
series: "Demo Series"
---

This is the second post in the **Demo Series**. The series navigation box at the top of this page lists both parts and marks this one as current.

## How it works

`_includes/series_nav.html` collects all posts with matching `series:` values, sorts them by date, and renders an ordered list. It only appears when at least two posts share the series.

```html
{%- if page.series -%}
  {%- assign series_posts = site.posts
        | where: "series", page.series
        | sort: "date" -%}
  {%- if series_posts.size > 1 -%}
    <!-- render nav box -->
  {%- endif -%}
{%- endif -%}
```

The related-posts section below will also show Part 1 since it belongs to the same series.
