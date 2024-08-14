---
layout: post
title: "Positional Encoding"
date: 2024-08-14 23:44:00 +0900
categories: ai
comments: true
visible: true
---

Positional Embedding 중 [Attention is all you need](https://arxiv.org/pdf/1706.03762)에 사용된 sinusoid 함수는 특별하다.

<img src="{{ "/assets/img/posts/2024-08-14-positional-encoding/sinusoid.png" | relative_url }}" width="480px"/>

핵심은 모든 position에서 같은 positional encoding을 보이는 패턴은 없다는 것이다.

위 함수는 아래처럼 엑셀에서 시각화해볼 수 있다.
경향성을 보기위해 상수 10000은 5로 대체했다.

각 row의 값(목록)은 모두 unique하다.
position은 정수이기 때문이다.

<img src="{{ "/assets/img/posts/2024-08-14-positional-encoding/visulization.png" | relative_url }}" width="480px"/>

이러한 positional encoding을 도입함으로써
[-1, 1] 사이의 값을 가지고, 미분 가능하며, position에 따른 절대값을 부여할 수 있는
장점을 가지게 된다.

