---
layout: post
title: "Payment schedule"
date: 2023-05-08 15:08:00 +0900
categories: tip
comments: true
visible: false
---
0. 용어
    * L: 대출 원금
    * R: 월 이자율(연 이자율 / 12)
    * N: 대출 기간(월)
1. 만기일시상환

    | 항목 | 값 |
    | -- | -- |
    | 월 상환 이자 | LR |
    | 월 상환 원금 | 0 |
    | 월 상환 합계 | LR |
    | 총 상환 이자 | LRN |
    | 총 상환 원금 | L |
    | 총 상환 합계 | L(RN+1) |
    
2. 원금균등상환

    | 항목 | 값 |
    | -- | -- |
    | 월 상환 이자 | LR(1-(i-1)/N) |
    | 월 상환 원금 | L/N |
    | 월 상환 합계 | LR+(1-iR)L/N |
    | 총 상환 이자 | LR(N+1)/2 |
    | 총 상환 원금 | L |
    | 총 상환 합계 | L(1+R(N+1)/2) |

3. 원리금균등상환

    | 항목 | 값 |
    | -- | -- |
    | 월 상환 이자 | 0 |
    | 월 상환 원금 | 0 |
    | 월 상환 합계 | LR(1+R)^N/((1+R)^N-1) |
    | 총 상환 이자 | $$\frac{L((RN-1)(1+R)^N+1)}{((1+R)^N-1)}$$ |
    | 총 상환 원금 | L |
    | 총 상환 합계 | LRN(1+R)^N/((1+R)^N-1) |


<script> MathJax = {   
    tex: {     inlineMath: [['$', '$'], ['\\(', '\\)']]   },   
    svg: {     fontCache: 'global'   } }; 
</script>
<script type="text/javascript" id="MathJax-script" async   src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"> </script>