---
layout: post
title: "AI Engineering: Chapter 9, 10"
date: 2025-03-16 12:00:00 +0900
categories: study ai-engineering
comments: true
visible: true
---
[AI Engineering by Chip Huyen](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)

## Chapter 9
추론 최적화: Inference Optimization

- 모델을 더 나은 성능으로, 더 저렴하게, 더 빠르게 만드는 것은 항상 중요
- 추론 최적화는 모델, 하드웨어, 서비스 레벨에서 가능
- AI 추론의 병목과 이를 극복하기 위한 기술 설명
- 종종 모델을 빠르게 만드는 건 비용도 줄이도록 함

### 추론 최적화 이해하기
- AI 모델의 생애 주기는 *훈련*과 *추론*의 구분된 시기를 지님
    - 훈련: 모델을 만드는 과정
    - 추론: 주어진 입력으로부터 출력을 계산하는 과정

#### 추론 개요
- 추론 서버<small>inference server</small>: 서비스 상황에서 모델 추론을 수행하는 주체
- <mark>모델 개발이 의미를 가지는 때는 </mark>$$ T <= p \times N $$, 즉 <mark>훈련 비용보다 추론을 통한 수입이 많을 때</mark>
- 모델을 직접 운영하면 추론 서비스를 직접 만들고, 최적화하고, 유지보수해야함

##### 계산 병목<small>Computational bottlenecks</small>
- 최적화는 병목을 찾고 해결하는 과정
- 2가지 주요 계산 병목
    - <mark>연산<small>Compute-bound</small>: 작업 완료 시간이 작업에 필요한 연산량에 의해 결정</mark>
    - <mark>메모리 대역폭<small>Memory bandwidth-bound</small>: 작업 완료 시간이 데이터 전송률(e.g. 메모리와 프로세서 간 데이터 이동)에 제한.</mark> 데이터를 CPU에서 GPU로 옮기는 건 많은 시간이 소요될 수 있음. *bandwidth-bound*로 줄이기도 함
        - *Memory-bound*는 메모리 용량을 의미할 때도 있는데, OOM과 같은 문제로 나타남. 보통 이는 작업을 작은 단위로 분리하여 해결할 수 있음. 대부분의 메모리 관련 제한은 메모리 대역폭에 의함.
- 연산 병목은 더 많은 칩(수평 확장) 또는 연산 능력이 더 큰 칩(수직 확장)을 사용함으로써 해결 가능
- 메모리 대역폭 병목은 더 큰 대역폭을 가진 칩(수직 확장)을 사용함으로써 해결 가능

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter9-10/figure9-2.png" | relative_url }}" width="540px"/></div>

- Stable Diffusion 같은 이미지 생성기는 대개 연산 병목을 지님
- 자기회귀적 언어 모델은 대개 메모리 대역폭 병목을 지님
- 트랜스포머 기반 언어 모델은 2가지 단계로 구성됨: prefill, decode ([Chapter 2](/study/ai-engineering/ai-engineering-1-2/))
    - <mark><i>Prefill</i>: 모델이 입력 토큰을 병렬로 처리하는 과정. <i>계산 병목</i></mark>을 지님
    - <mark><i>Decode</i>: 모델이 한 번에 하나의 출력 토큰을 생성하는 과정.</mark> 모델 가중치와 같은 대형 행렬을 불러오는 단계를 포함하여 하드웨어가 얼마나 빠르게 메모리에 데이터를 불러오는가에 제한을 받음. <mark><i>메모리 대역폭 병목</i></mark>을 지님

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter9-10/figure9-3.png" | relative_url }}" width="540px"/></div>

- <mark>실제 서비스에선 prefill과 decode가 별개 장비로 분리 실행되는 경우가 많음</mark>
- LLM 병목에 영향을 주는 요소는 컨텍스트 길이, 출력 길이, 요청 배치 전략이 있음
    - 긴 컨텍스트는 대개 메모리 대역폭 병목 작업부하를 일으킴

##### 추론 API: 온라인과 배치<small>Online and batch inference APIs</small>
- <mark>온라인 API<small>Online APIs</small>: 지연 시간을 최적화</mark>. 낮은 지연 시간에 집중.
- <mark>배치 API<small>Batch APIs</small>: 비용을 최적화</mark>. 높은 처리량<small>throughput</small>에 집중.
    - 전통적 ML에서 배치 추론은 LLM과 의미가 다른데, 요청 전 예측을 미리 계산하는 과정을 의미. 추천 시스템에서 미리 모든 사용자의 추천을 생성해두는 것과 같은 예시가 있음.

#### 추론 성능 지표
- 사용자 관점에서 중심축은 지연시간
- 비용 계산을 위해서는 처리량<small>throughput</small>과 사용량<small>utilization</small>도 중요

##### 지연 시간, TTFT, TPOT
- 시간 지표 정의
    - <mark>지연 시간<small>latency</small>: 사용자 질의 전송 후 답변 전부를 수신하는데까지 걸린 시간</mark>
    - <mark>TTFT<small>Time to first token</small>: 사용자 질의 전송 후 첫 토큰이 생성된 시간. prefill 과정의 소요 시간에 따르며 입력 길이에 의존함.</mark>
    - <mark>TPOT<small>Time per output token</small>: 첫 토큰 이후 각 출력 토큰 생성 간 걸리는 시간.</mark> 스트리밍 모드에서 사람의 읽기 속도인 120 ms/token에 준하는 속도면 충분하므로, TPO는 120 ms 또는 6-8 tokens/s가 대부분의 용도에 충분함.
- <mark>TPOT을 희생하여 TTFT를 줄이려면 decode 연산 자원을 prefill 연산 자원으로 옮기는 것으로 가능</mark>
- 에이전트 질의는 중간 과정이 보이지 않아서 *time to publish*라는 첫 토큰의 사용자 노출 소요 시간을 의미하는 용어도 사용
- Anyscale 연구에 따르면 전체 지연 시간에 있어서 입력 토큰 100개는 출력 토큰 1개와 비슷한 영향도를 지님
- 지연 시간은 분포를 따르기 때문에, 평균보다 percentile을 확인하는 것이 유용함
    - 이상점은 평균을 왜곡시킬 수 있고 흔히 발생함
    - p50(중앙값), p90, p95, p99을 흔히 사용
- TTFT와 입력 길이의 관계를 도표화하면 유용

##### 처리량과 유효 처리량<small>Throughput and goodput</small>
- <mark>처리량<small>throughput</small></mark>은 모든 사용자 및 요청에 대해 추론 서비스가 생성할 수 있는 <mark>초당 출력 토큰 수(tokens/s; TPS)</mark>를 측정
- 주어진 시간 동안 완전히 수행된 요청 수로 측정할 수 있음
- 파운데이션 모델의 생성 속도로 인해 대개 RPM<small>requests epr minute</small>로 측정됨
- 처리량을 관찰하면 추론 서비스가 동시 요청을 얼마나 잘 다룰 수 있는지 이해하는데 도움이 됨
- <mark>높은 처리량은 대개 낮은 비용을 의미함</mark>
<aside mark="💡">
비용 계산 예시<br/>
<ul>
<li>prefill: 시스템 연산 비용 $2/h, prefil 소요 시간 1min/100req일 때 1,000 요청 처리 비용은 $0.33. $$ 1000\text{req} \times 1\text{min}/100\text{req} \times $2/h = $0.33$$
</li>
<li>decode: 시스템 연산 비용 $2/h, 처리량 100 tokens/s이면 요청당 평균 출력 토큰 수가 200일 때 1,000 요청 처리 비용은 $1.11. $$ 1000\text{req} \times \frac{ 200\text{tokens}/\text{req}}{100 \text{tokens}/s} \times $2/h = $1.11$$
</li>
</ul>
</aside>

- 일관된 입력 및 출력 길이를 가진 작업 부하의 경우 최적화가 더 쉬움
- 비슷한 크기의 모델, 하드웨어, 작업 부하를 사용해도 토큰 구성과 토크나이저가 다를 수 있어서 직접 비교는 어려움
    - <mark>추론 서버 효율은 요청 당 비용</mark> 지표를 이용하는 게 나음
- AI 앱은 지연 시간, 처리량 간 trade-off 관계가 있음
    - 배치 같은 기술은 처리량을 향상시키지만 지연 시간을 늘림
- [LinkedIn AI 팀, 2024](https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product?_l=en_US)에 다르면 처리량을 2, 3배 늘리려면 TTFT나 TPOT 희생이 필요한 경우가 많았음
- <mark>유효 처리량<small>goodput</small>은 초당 SLO를 만족하는 요청의 수를 측정</mark>

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter9-10/figure9-4.png" | relative_url }}" width="540px"/></div>

#### 사용량, MFU, MBU<small>Utilization, MFU, and MBU</small>
- <mark>사용량<small>utilization</small>은 자원이 효율적으로 이용되는 양을 측정. 주로 총 가용량에 비해 활성화된 자원의 비율로 정량화됨</mark>
- *GPU utilization* 용어는 오해하기 쉬움
    - [nvidia smi](https://developer.nvidia.com/system-management-interface)에서 나타내는 GPU utilization은 GPU가 활성화되어 작업을 처리하는 시간 비율을 의미함
    - GPU가 100op/s를 처리할 수 있어도 1op/s를 처리하는 GPU는 nvdia-smi의 GPU Utilization 정의에 따라 100%로 나타날 수 있음
- <mark>MFU<small>Model FLOP/s Utilization</small>: 최대 FLOP/s로 가동되는 시스템의 이론적 최대 처리량에 비해 관찰된 처리량(tokens/s)의 비율</mark>
- <mark>MBU<small>Model Bandwidth Utilization</small>: 메모리 대역폭 사용 비율</mark>
- LLM의 메모리 대역폭 사용량 수식

$$ (\text{parameter count} × \text{bytes/param} × \text{tokens/s}) / (\text{theoretical bandwidth}) $$

- 메모리 대역폭 사용에 있어 <mark>파라미터당 bytes의 영향도로 인해 양자화가 중요함</mark>
- 처리량(tokens/s)과 MBU, 처리량과 MBU이 각각 비례하기 때문에 처리량을 MBU, MFU로 가늠할 수 있음
- 연산 병목 작업 부하는 MFU가 높고 MBU가 낮은 경향
- 메모리 병목 작업 부하는 MFU가 낮고 MBU가 높은 경향
- MFU는 대개 훈련 시가 추론 시보다 높음
- 추론에서 prefill이 연산 병목, decode가 메모리 병목을 지니기 때문에 prefill의 MFU는 decode보다 높음
- 현재로서는 50% 초과의 MFU는 좋은 수치

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter9-10/table9-1.png" | relative_url }}" width="540px"/></div>

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter9-10/figure9-5.png" | relative_url }}" width="540px"/></div>

#### AI 가속기

### 추론 최적화

#### 모델 최적화

#### 추론 서비스 최적화


## Chapter 10
AI 엔지니어링 구성 체계와 사용자 피드백

### AI 엔지니어링 구성 체계<small>AI Engineering Architecture</small>

#### 1단계. 컨텍스트 개선

#### 2단계. 보호 장치 마련<small>Put in Guardrails</small>

#### 3단계. 모델 라우터와 게이트웨이 추가<small>Add Model Router and Gateway</small>

#### 4단계. 캐시로 지연 시간 축소

#### 5단계. 에이전트 패턴 추가

#### 모니터링과 관찰 가능성<small>Monitoring and Observability</small>

#### AI 파이프라인 오케스트레이션<small>AI Pipeline Orchestration<small>

### 사용자 피드백

#### 대화 피드백 추출

#### 피드백 설계

#### 피드백 한계

<style>
img {
    margin: auto;
}
</style>