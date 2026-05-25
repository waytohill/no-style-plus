---
layout: page
title: Tags
permalink: /tags/
---

{% assign sorted_tags = site.tags | sort %}
{% if sorted_tags.size == 0 %}
<p>No tags yet.</p>
{% else %}

{% assign max_count = 0 %}
{% for tag in sorted_tags %}
  {% if tag[1].size > max_count %}{% assign max_count = tag[1].size %}{% endif %}
{% endfor %}

<div class="tag-cloud" aria-label="Tag cloud">
{% for tag in sorted_tags %}
  {% assign sz = tag[1].size %}
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
  <a class="{{ cls }}" href="#{{ tag[0] | slugify }}">#{{ tag[0] }}<span class="tc-count">{{ sz }}</span></a>
{% endfor %}
</div>

<hr>

{% for tag in sorted_tags %}
{% assign tag_name = tag[0] %}
{% assign tag_posts = tag[1] %}
<h2 id="{{ tag_name | slugify }}">#{{ tag_name }} <small>({{ tag_posts.size }})</small></h2>
<ul class="archive-list">
  {% for post in tag_posts %}
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
