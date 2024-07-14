---
layout: default
---
<head>
  <script src="/assets/js/post.js"></script>
</head>
<div class="home">
  {{ content }}

  {% if site.paginate %}
    {% assign posts = paginator.posts %}
  {% else %}
    {% assign posts = site.posts %}
  {% endif %}


  {%- if posts.size > 0 -%}
    {%- if page.list_title -%}
      <h2 class="post-list-heading">{{ page.list_title }}</h2>
    {%- endif -%}
    <ul class="post-list">
      {%- assign date_format = site.date_format | default: "%b %-d, %Y" -%}
      {%- for post in posts -%}
      {%- if post.visible == true or post.visible == "true" or post.visible == nul -%}
      {%- assign words = post.content | number_of_words -%}
      <li>
        <a class="post-link" href="{{ post.url | relative_url }}">
          <div><h3>{{ post.title | escape }}</h3></div>
          <div class="post-meta-wrapper">
            <span class="post-meta">{{- post.date | date: date_format }} &middot; {{ words | divided_by:180 }} min read</span>
          </div>
          {%- if site.show_excerpts -%}
          <div class="excerpt">{{ post.content | strip_html | truncate: 200 }}</div>
          {%- endif -%}
        </a>
      </li>
      {%- endif -%}
      {%- endfor -%}
    </ul>

    {% if site.paginate %}
      <div class="pager">
        <ul class="pagination">
        {%- if paginator.previous_page %}
          <li><a href="{{ paginator.previous_page_path | relative_url }}" class="previous-page">{{ paginator.previous_page }}</a></li>
        {%- endif %}
          <li><div class="current-page">{{ paginator.page }}</div></li>
        {%- if paginator.next_page %}
          <li><a href="{{ paginator.next_page_path | relative_url }}" class="next-page">{{ paginator.next_page }}</a></li>
        {%- endif %}
        </ul>
      </div>
    {%- endif %}

  {%- endif -%}

</div>