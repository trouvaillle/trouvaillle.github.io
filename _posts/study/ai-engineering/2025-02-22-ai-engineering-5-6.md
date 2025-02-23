---
layout: post
title: "AI Engineering: Chapter 5, 6"
date: 2025-02-22 12:00:00 +0900
categories: study ai-engineering
comments: true
visible: true
---
[AI Engineering by Chip Huyen](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)

## Chapter 5
Prompt Engineering: 프롬프트 엔지니어링
- <mark>프롬프트 엔지니어링은 모델이 원하는 결과를 생성하도록 지시를 만드는 과정</mark>
- 모델의 가중치를 변화시키지 않고 모델의 행동을 유도(파인튜닝과 다른 점)
- 파인튜닝처럼 자원 집약적인 기술을 도입하기 전에 프롬프트를 다듬을 필요가 있음
- 프롬프트 엔지니어링은 사람과 AI 간 소통에 관한 것
- 상용화를 위해서는 프롬프트 엔지니어링 뿐만 아니라 통계학, 엔지니어링, 전통적 ML 지식(추적, 평가, 데이터셋 선별)이 필요

### 프롬프트 엔지니어링 소개
- <mark>프롬프트는 모델이 작업을 수행하게 하기 위한 지시</mark>
- 프롬프트의 일반적 구조
    - <mark>작업 정의</mark>: 모델이 수행하기 원하는 것(역할과 출력 형태 포함)
    - <mark>예제</mark>: 문장의 유해성을 판별하기 위해선 유해하거나 무해한 예제를 제시해야함
    - <mark>작업</mark>: 모델이 수행하기 원하는 구체적인 작업. 답변을 원하는 질문이나 요약하기 원하는 책을 제시

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter5-6/figure5-1.png" | relative_url }}" width="540px"/></div>

- <mark>프롬프트가 동작하려면 대상 모델이 지시를 따르는 능력이 있어야 함</mark>
- 필요한 프롬프트 엔지니어링의 양은 모델이 프롬프트 변동<small>perturbation</small>에 얼마나 강건한<small>robust</small>지에 따라 다름
- 모델의 강건함은 프롬프트를 임의로 변동시키고 출력이 어떻게 달라지는지로 측정할 수 있음

<aside mark="💡">
GPT-4를 포함한 <mark>대부분의 모델은 프롬프트의 도입부에 작업 정의를 제시할 경우 품질이 좋아짐.</mark><br/>
Llama 3 같은 일부 모델은 마지막에 제시하는 것이 효과적.
</aside>

#### 문맥 내 학습: 제로샷과 퓨샷
- <mark>프롬프트를 통해 모델이 어떤 일을 수행해야하는지 가르치지는 것을 문맥 내 학습<small>in-context learning</small>이라함</mark>
    - GPT-3 논문 [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165)에서 소개됨
- 모델을 바람직한 행동을 프롬프트의 예제로부터 배울 수 있음. 기존에 훈련된 방식과 다르게도 가능. 가중치 업데이트는 필요 없음
- 문맥 내 학습은 모델이 새로운 정보를 지속적으로 통합하여 결정을 내릴 수 있게 하여 모델이 구식이 되지 않도록 방지
- <mark>shot</mark>: 프롬프트에 제시된 예제를 의미
    - *few-shot learning*: 프롬프트의 예제로부터 모델이 학습하도록 가르치는 것
    - *5-shot learning*: 에제가 5개인 경우
    - *zero-shot learning*: 예제가 제공되지 않는 경우
- 일반적으로 예제가 많을 수록 모델은 더 잘 배움
    - 예제의 수는 모델의 최대 컨텍스트 길이에 제한됨
    - 예제가 많을 수록 프롬프트가 길어지고 추론 비용이 증가함
- 모델이 강해질 수록 지시를 잘 이해하고 따르기 때문에 적은 예제로 더 나은 성능을 보여줌
    - GPT-3에서 few-shot learning은 zero-shot learning에 비해 큰 향상을 보여줬음
    - GPT-4 같은 이후 모델에서는 효과가 적어짐
- 도메인 특화 사용의 경우 few-shot 예제의 효과가 큼
    - 모델 훈련에 사용되지 않은 예제를 제시하는 경우
- *context*와 *prompt*의 정의
   - 책에서는 아래와 같이 정의함
       - *context*: 모델에 제공된 맥락 정보
       - *prompt*: 모델에 입력된 전문
   - GPT-3 논문에서는 *context*와 *prompt*가 동일한 의미였음
   - 일부 사람들은 *context*는 맥락 정보만을 의미한다고 주장
- GPT-3 이전 ML 모델들은 훈련된 내용만 수행할 수 있었기에 문맥 내 학습은 마법처럼 느껴졌음
- <mark>프롬프트 엔지니어링은 모델이 훈련된 여러 프로그램 중 원하는 프로그램을 활성화하는 올바른 프롬프트를 찾는 과정으로 이해할 수 있음</mark>
    - <span title="ML 프레임워크 Keras의 창시자">François Chollet</span>이 [파운데이션 모델을 여러 프로그램의 라이브러리로 비유](https://fchollet.substack.com/p/how-i-think-about-llm-prompt-engineering)한데서 유래

#### 시스템 프롬프트와 유저 프롬프트
- 많은 모델 API는 프롬프트를 시스템 프롬프트와 유저 프롬프트로 나누어 입력하는 선택지를 제공
- 시스템 프롬프트는 작업 정의, 유저 프롬프트는 작업으로 생각할 수 있음

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter5-6/sys-user-pmt.png" | relative_url }}" width="540px"/></div>
{% raw %}
- 모델은 주어진 시스템 프롬프트와 유저 프롬프트를 하나의 프롬프트를 템플릿에 따라 결합함
    - Llama 2 chat model prompt template
        ```js
        <s>[INST] <<SYS>>
        {{ system_prompt }}
        <</SYS>>
        {{ user_message }} [/INST]
        ```
    - 예시
        ```js
        <s>[INST] <<SYS>>
        Translate the text below into French
        <</SYS>>
        How are you? [/INST]
        ```
    - 모델의 chat template: 모델 개발자가 정의하는 양식(모델의 문서에서 찾을 수 있음)
    - prompt template: 앱 개발자가 정의하는 양식
    - Llama 3 chat model prompt template
        ```js
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        {{ system_prompt }}<|eot_id|><|start_header_id|>user<|end_header_id|>
        {{ user_message }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
        ```
    - `<|`와 `|>`를 포함하는 사이의 단어는 모델에서 하나의 토큰으로 처리됨(e.g. `<|begin_of_text|>`)

{% endraw %}

#### 컨텍스트 길이와 컨텍스트 효율화

### 프롬프트 엔지니어링 모범 사례
#### 쉽고 명확한 지시를 작성하라
#### 충분한 켄텍스트를 제공하라
#### 복잡한 작업을 하위 작업으로 나누어라
#### 모델이 생각할 시간을 제공하라
#### 프롬프트를 반복적으로 개선하라
#### 프롬프트 엔지니어링 도구 평가하기
#### 프롬프트 정리 및 버전 관리




<br/><br/>

## Chapter 6
RAG and Agents: RAG와 에이전트
