---
layout: default
author_profile: true
sidebar_main: true
---
{%- assign category = page.category | default: page.title -%}
<h3>{{ category }} &middot; <small>{{ site.categories[category].size }}</small></h3>
<ul class="post-list">
  {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
  {%- for post in site.categories[category] -%}
    {%- if post.visible == true or post.visible == "true" or post.visible == nul -%}
      {%- assign words = post.content | number_of_words -%}
      <li>
        <a class="post-link" href="{{ post.url | relative_url }}">
          <div><h1>{{ post.title | escape }}</h1></div>
          <div class="post-meta-wrapper">
            <span class="post-meta">{{ post.categories | join: ' / ' }} &middot; {{ post.date | date: date_format }} &middot; {{ words | divided_by:180 }} min</span>
          </div>
          {%- if site.show_excerpts -%}
          <div class="excerpt">{{ post.content | strip_html | truncate: 200 }}</div>
          {%- endif -%}
        </a>
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>
