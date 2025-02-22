---
layout: default
header_pages:
- _pages/category.md
- _pages/app.md
---
<article class="post h-entry" itemscope itemtype="http://schema.org/BlogPosting">
    <div class="post-categories">
        <a class="prev" href="javascript:window.history.back();">&larr;</a>
        <div class="links">
            {% assign link = '/category/' %}
            {% for category in page.categories %}
            {% assign link = link | append: category | append: '/' %}
            <span class="link">
                <a href={{link}}>{{ category }}</a>
            </span>
            {% unless forloop.last %}
            <span class="divider">/</span>
            {% endunless %}
            {% endfor %}
        </div>
        <br/>
    </div>
    <header class="post-header">
        <h1 class="post-title p-name" itemprop="name headline">{{ page.title | escape }}</h1>
        <div class="post-meta">
            <div class="left">
                {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
                {%- assign words = content | number_of_words -%}
                <time class="dt-published" datetime="{{ page.date | date_to_xmlschema }}" itemprop="datePublished">
                    {{ page.date | date: date_format }}
                </time>
                {%- if page.modified_date -%}
                ~
                {%- assign mdate = page.modified_date | date_to_xmlschema -%}
                <time class="dt-modified" datetime="{{ mdate }}" itemprop="dateModified">
                    {{ mdate | date: date_format }}
                </time>
                {%- endif -%}
                {%- if page.author -%}
                • {% for author in page.author %}
                <span itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span class="p-author h-card" itemprop="name">
                        {{- author -}}
                    </span>
                </span>
                {%- if forloop.last == false %}, {% endif -%}
                {%- endfor -%}
                {%- endif -%}
                <span>&middot; {{ words | divided_by:180 }} min</span>
                <!--<span> &middot; </span>
                <span>written by <a href="https://github.com/trouvaillle">trouvaillle</a></span>-->
            </div>
            <div class="right">
                <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?&title_bg=%23555555&count_bg=%23787878&url={{ site.url | uri_escape }}{{ page.url | replace: '.html', '' | uri_escape }}"></img>
            </div>
        </div>
    </header>

    <div class="post-content e-content" itemprop="articleBody">
        {{ content }}
    </div>
    
    <!--
    <div class="post-page-navigation">
        <div class="prev">
            {% if page.previous.url %}
            <a class="prev" href="{{page.previous.url}}">&laquo; previous</a>
            {% endif %}
        </div>
        <div class="next">
            {% if page.next.url %}
            <a class="next" href="{{page.next.url}}">next &raquo;</a>
            {% endif %}
        </div>
    </div>
    -->
    <div style="margin-bottom: 3rem; display: block;"></div>

    <script src="https://utteranc.es/client.js"
        repo="trouvaillle/trouvaillle.github.io"
        issue-term="pathname"
        label="utterances"
        theme="github-dark"
        crossorigin="anonymous"
        async>
    </script>

    {%- if site.disqus.shortname and site.disqus.enabled -%}
    {%- include disqus_comments.html -%}
    {%- endif -%}

    <a class="u-url" href="{{ page.url | relative_url }}" hidden></a>
</article>