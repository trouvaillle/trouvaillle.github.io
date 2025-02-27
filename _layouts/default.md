---
layout: default
---
<head>
  <meta name="google-site-verification" content="Up4NMaytjs0u212Seq63B4_XdJdBWrvUOVROrWpg5cc" />
  <meta name="naver-site-verification" content="ca101c91aa6dd3f888eefb8a4894a628c9c75ff4" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Trouvaillle log.</title>
  <link rel="stylesheet" type="text/css" href="{{ '/assets/css/style.css' | relative_url }}"/>
  <link rel="icon" type="image/png" href="{{ '/favicon.png' | relative_url }}" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <script src="{{ '/assets/js/post.js' | relative_url }}"></script>
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-3VSF418X77"></script>
  <!-- MathJax -->
  <script type="text/javascript" async
    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
  </script>
  <script type="text/javascript">
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-3VSF418X77');
  </script>

  <!-- Google adsense-->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7824775648651112"
    crossorigin="anonymous"></script>
</head>
<div id="root">
  <div class="header">
    <h1 class="page-heading">
      <a href="{{ site.url }}">
        {{ site.title }}
      </a>
    </h1>
    <div id="menu" class="menu">
      <div class="center">
      <i class="bi bi-list"></i>
      </div>
    </div>
  </div>
  <div class="floating-sidebar">
    <div class="floating-transparent">
    </div>
    <div class="floating-categories">
    {%- include category-list-sidebar.html -%}
    {%- include app-list.html -%}
    </div>
  </div>
  <div class="wrapper">
    <div class="sidebar">
      <div class="header">
          <h1 class="page-heading">
            <a href="{{ site.url }}">
              {{- site.title -}}
            </a>
            <div class="hide"><span>&#x276E;</span></div>
          </h1>
        </div>
      {%- include category-list-sidebar.html -%}
    </div>
    <div class="container">
      {{ content }}
    </div>
  </div>
</div>
