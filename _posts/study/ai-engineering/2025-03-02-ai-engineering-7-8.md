---
layout: post
title: "AI Engineering: Chapter 7, 8"
date: 2025-03-02 12:00:00 +0900
categories: study ai-engineering
comments: true
visible: true
---
[AI Engineering by Chip Huyen](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)

## Chapter 7
Finetuning: 파인튜닝

- <mark>파인튜닝은 모델의 전체 또는 일부를 추가적으로 학습시켜서 특정 작업에 적응<small>adapt</small>시키는 과정을 말한다.</mark>
    - 모델의 가중치를 조정한다.
- 모델의 도메인 특화 기능을 향상시킬 수 있다.
    - 코딩이나 의학 질의응답
- 모델의 안전성을 강화할 수 있다.
- 대부분 모델의 지시 수행 능력을 향상시키는데 사용된다. 특히 특정 출력 스타일이나 형식에 준수하도록 하기 위해 활용된다.
- 언제 파인튜닝 또는 RAG를 해야할지는 흔한 질문이다.
- 프롬프트 기반 방법과 다르게 <mark>파인튜닝은 훨씬 많은 메모리 발자국</mark>을 유발한다.
    - 많은 파인튜닝 기술들은 메모리 요구량을 줄이는 것에 착안하여 개발됐다.
- <mark><i>PEFT</i><small>parameter-efficient finetunig</small>는 메모리 효율적인 접근</mark>으로 파인튜닝 영역에서 지배적이되었다.
    - PEFT에서는 특히 adpater-based 기술을 살펴본다.

### 파인튜닝 개요
- 파인튜닝은 필요한 능력을 가진 베이스 모델로 시작한다.
- <mark>파인튜닝의 목표는 베이스 모델을 특정 작업을 더 잘 수행하도록 만드는 것이다.</mark>
- 파인튜닝은 전이 학습<small>transfer learning</small>의 한 방법이다.
    - 전이 학습은 Bozinov‐ski와 Fulgosi에 의해 1976년 처음 소개되었다.
    - 전이 학습은 한 작업에서 얻어진 지식을 새로운 작업의 학습 가속을 위해 전이하는 방법에 집중한다.
    - 피아노를 칠 줄 아는 사람이 다른 악기를 더 쉽게 다루는 것과 비슷하다.
- 딥러닝 초창기 동안 전이 학습은 제한되거나 값비싼 훈련 데이터를 지닌 작업에 대한 해결책을 제시했다.
- LLM에서 텍스트 완성을 위한 사전 학습에서 얻어진 지식은 특화된 작업인 법률 질의응답이나 text-to-SQL로 전이될 수 있다.
    - 전이 학습의 능력은 파운데이션 모델을 더 가치있게 만들 수 있다.
- <mark>전이 학습은 샘플 효율성<small>sample efficiency</small>를 향상시키고 모델은 더 적은 예제로 같은 행동을 효과적으로 배우게 할 수 있다.</mark>
    - 예를 들어, 법률 질의응답 모델을 처음부터 만드려면 100만개의 예제가 필요하겠지만, 좋은 베이스 모델을 파인튜닝할 때는 수백개의 예제로 충분하다.
- <mark>이상적으로 보면, 모델이 배워야 할 많은 내용은 이미 베이스 모델에 포함되어 있으며, 파인튜닝은 모델의 행동을 다듬는 역할을 한다.</mark>
    - OpenAI의 [InstructGPT (2022)](https://arxiv.org/abs/2203.02155)에서는 모델이 이미 가지고 있으나 사용자들이 프롬프팅만으로는 접근하기 어려운 능력을 파인튜닝이 잠금 해제한다는 관점을 제안한다.
<aside mark="💡">
전이 학습은 파인튜닝 뿐만 아니라 특징 기반 전이<small>feature-based transfer</small>로도 가능하다.<br/>
특징 기반 전이에서는 모델이 데이터로부터 특징을 추출하고 다른 모델에서 이를 이용한다.<br/>
특징 기반 전이의 예로, 파운데이션 모델은 분류 헤드<small>classifier head</small>를 추가하여 분류 작업에 재사용될 수 있다.
</aside>
- 파인튜닝은 모델 학습 과정의 일부이며, 사전 학습의 확장이다.
    - 파인튜닝은 사전 학습 이후의 모든 훈련을 의미한다.
- 모델 훈련 과정은 사전 학습으로 시작되며 자기 지도<small>self-supervision</small>로 이루어진다.
    - 자기 지도는 모델이 레이블되지 않은 다량의 데이터로부터 학습할 수 있도록 한다.
    - 언어 모델에서 자기 지도 데이터는 주석이 필요없는 텍스트의 나열을 의미한다.
- <mark>값비싼 작업 특화 데이터로 파인튜닝하기 전에, 저렴한 작업 연관 데이터로 자기 지도 파인튜닝을 할 수 있다.</mark>
    - 예를 들어, 법률 질의응답의 경우 날 것의 법률 문서로 파인튜닝할 수 있다.
    - 모델이 베트남어로 책 요약을 하도록 파인튜닝하려면 많은 베트남어 텍스트로 먼저 인튜닝할 수 있다.
- 자기 지도 파인튜닝<small>self-supervised finetuning</small>은 연속 사전 학습<small>continued pre-traning</small>이라고도 불린다.
- 지도 파인튜닝<small>supervised finetuning</small>을 통해 모델이 다음 토큰이나 빈 칸을 채우도록 파인튜닝할 수 있다.
    - 후자는 빈 칸 채우기 파인튜닝<small>infilling finetuning</small>이며 텍스트 편집이나 코드 디버깅 같은 작업에 특히 유용하다. 
    - 모델이 자기회귀적<small>autoregressively</small>으로 사전 학습되었더라도 빈 칸 채우기 파인튜닝을 할 수 있다.
- <mark>지도 파인튜닝은 고품질의 주석이 달린 데이터를 사용하여 모델을 인간의 사용 방식과 선호도에 맞게 다듬는다.</mark>
- <mark>지도 파인튜닝 동안 모델은 (입력, 출력) 쌍으로 훈련된다.</mark>
    - 입력은 지시, 출력은 답변이 될 수 있다.
- 답변은 책 요약처럼 열린 결말<small>open-ended</small>이거나 분류 작업처럼 닫힌 결말<small>close-ended</small>일 수 있다.
- 고품질 지시 데이터는 만들기 어렵고 비쌀 수 있다. 특히 사실적 일관성, 도메인 전문가, 정치적 올바름을 요구하는 지시일 경우 더 그렇다.
- <mark>모델은 사람의 선호도를 최대화할 수 있는 답변을 생성하도록 강화 학습으로 파인튜닝될 수 있다.</mark>
    - <mark>선호도 파인튜닝<small>preference finetuning</small>은 주로 (지시, 이긴 답변, 진 답변)의 형식을 따르는 비교 데이터를 필요로 한다.</mark>
- <mark>컨텍스트 길이를 늘리기 위해 모델을 파인튜닝할 수 있다.</mark>
    - 긴 컨텍스트 파인튜닝<small>long-context finetuning</small>은 주로 모델의 구조를 수정할 필요가 있다. 일례로, 위치 임베딩<small>positional embedding</small>을 조정해야 한다.
    - 긴 시퀀스는 토큰이 더 많은 가능한 위치를 가진다는 것이고, 위치 임베딩은 이를 처리할 수 있어야 한다.
    - 긴 컨텍스트 파인튜닝은 다른 파인튜닝보다 수행하기 어렵고, 결과 모델은 짧은 시퀀스에 대해 품질이 저하될 수 있다.
- 모델 개발자는 다른 목적으로 파인튜닝된 여러 모델 버전을 출시할 수 있으며, 애플리케이션 개발자는 적합한 모델을 선택할 수 있다.

<div style="text-align: center;"><img src="{{ "/assets/img/posts/study/ai-engineering/chapter7-8/figure7-1.png" | relative_url }}" width="540px"/><p>Code Llama 모델에 적용된 여러 파인튜닝 기술들</p></div>

### 언제 파인튜닝을 해야할까?
#### 파인튜닝할 이유
#### 파인튜닝하지 않을 이유
#### 파인튜닝과 RAG

### 메모리 병목
#### 역전파와 훈련 가능한 파라미터
#### 메모리 사용량 계산
#### 수 표현<small>Numerical Presentations</small>
#### 양자화<small>Quantization</small>

### 파인튜닝 기술
#### 파라미터 효율적인 파인튜닝<small>Parameter-Efficent Finetuning</small>
#### 모델 병합과 다중 작업 파인튜닝
#### 파인튜닝 전략

### 요약

## Chatper 8
Dateset Engineering: 데이터셋 엔지니어링

### 데이터 선별<small>Data Curation</small>
#### 데이터 품질
#### 데이터 포괄성<small>Data Coverage</small>
#### 데이터 양
#### 데이터 획득과 주석<small>Data Acquistion and Annotation</small>

### 데이터 증강 및 합성
#### 왜 데이터 합성을 할까?
#### 전통적인 데이터 합성 기술
#### AI 기반 데이터 합성
#### 모델 증류<small>Model Distillation</small>

### 데이터 처리
#### 데이터 검사
#### 데이터 중복 제거
#### 데이터 지우기 및 필터
#### 데이터 형식 맞추기

### 요약