---
title: App
layout: default
permalink: /app/
---
<h3>App</h3>
{%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
<ul class="app-list" style="list-style: none; margin-left: 0;">
    {%- assign apps = site.app | sort -%}
    {%- for app in apps -%}
        {%- if  app.visible == true or app.visible == "true" or app.visible == nul -%}
            <li class="site-app" style="border-bottom: solid 1px #333; padding: 8px 0;">
                <span class="post-meta">{{- app.date | date: date_format }}</span>
                <h2 style="margin: 0;">
                    <a class="site-app-text" href="{{ app.permalink }}">
                        {{ app.title }}
                    </a>
                </h2>
            </li>
        {%- endif -%}
    {%- endfor -%}
</ul>
