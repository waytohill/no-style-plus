---
layout: page
title: Categories
permalink: /categories/
---

{% assign sorted_cats = site.categories | sort %}
{% if sorted_cats.size == 0 %}
<p>No categories yet.</p>
{% else %}

{% assign max_count = 0 %}
{% for cat in sorted_cats %}
  {% if cat[1].size > max_count %}{% assign max_count = cat[1].size %}{% endif %}
{% endfor %}

<div class="tag-cloud" aria-label="Category cloud">
{% for cat in sorted_cats %}
  {% assign sz = cat[1].size %}
  {% if max_count <= 1 %}
    {% assign cls = 'tc-md' %}
  {% else %}
    {% assign ratio_x10 = sz | times: 10 | divided_by: max_count %}
    {% if ratio_x10 >= 8 %}{% assign cls = 'tc-xl' %}
    {% elsif ratio_x10 >= 5 %}{% assign cls = 'tc-lg' %}
    {% elsif ratio_x10 >= 3 %}{% assign cls = 'tc-md' %}
    {% else %}{% assign cls = 'tc-sm' %}
    {% endif %}
  {% endif %}
  <a class="{{ cls }}" href="#{{ cat[0] | slugify }}">{{ cat[0] }}<span class="tc-count">{{ sz }}</span></a>
{% endfor %}
</div>

<hr>

{% for cat in sorted_cats %}
{% assign cat_name = cat[0] %}
{% assign cat_posts = cat[1] %}
<h2 id="{{ cat_name | slugify }}">{{ cat_name }} <small>({{ cat_posts.size }})</small></h2>
<ul class="archive-list">
  {% for post in cat_posts %}
    {%- assign desc = post.description | default: "" | strip -%}
    {%- if desc == "" -%}
      {%- assign desc = post.excerpt | strip_html | normalize_whitespace | truncate: 90 -%}
    {%- endif -%}
    <li>
      <span>{{ post.date | date: site.theme_config.date_format }}</span>
      {% if site.theme_config.lowercase_titles %}
      <a href="{{ post.url | relative_url }}">{{ post.title | downcase }}</a>
      {% else %}
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      {% endif %}
      {%- if desc != "" -%}
        <div class="post-list-desc">{{ desc }}</div>
      {%- endif -%}
    </li>
  {% endfor %}
</ul>
{% endfor %}

{% endif %}
