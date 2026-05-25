---
layout: post
title: "Mermaid Diagrams"
date: 2026-01-05 10:00:00 +0000
categories: [tutorial]
tags: [web]
author: "demo"
published: true
description: "Flowcharts and diagrams via Mermaid, lazy-loaded from CDN."
comments: false
toc: false
---

Mermaid is loaded from CDN **only** when the page contains at least one fenced `mermaid` block. If no block exists, zero JS is loaded.

## Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Ship it]
    B -->|No| D[Debug]
    D --> B
    C --> E[Done]
```

## Sequence diagram

```mermaid
sequenceDiagram
    Browser->>+Server: GET /post
    Server-->>-Browser: 200 OK (HTML)
    Browser->>+CDN: GET mermaid.min.js
    CDN-->>-Browser: mermaid.js
    Browser->>Browser: render diagrams
```

## Class diagram

```mermaid
classDiagram
    class Post {
        +String title
        +Date date
        +List tags
        +render()
    }
    class Layout {
        +String name
        +include(name)
    }
    Post --> Layout : uses
```

Dark mode is handled automatically because Mermaid's `neutral` theme is grayscale and the page-level `invert()` filter handles the flip.
