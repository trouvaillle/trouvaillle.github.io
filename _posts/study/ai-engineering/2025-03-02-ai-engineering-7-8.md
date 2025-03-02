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

- 파인튜닝은 모델의 전체 또는 일부를 추가적으로 학습시켜서 특정 작업에 적응<small>adapt</small>시키는 과정을 말한다.
    - 모델의 가중치를 조정한다.
- 모델의 도메인 특화 기능을 향상시킬 수 있다.
    - 코딩이나 의학 질의응답
- 모델의 안전성을 강화할 수 있다.
- 대부분 모델의 지시 수행 능력을 향상시키는데 사용된다. 특히 특정 출력 스타일이나 형식에 준수하도록 하기 위해 활용된다.

### 파인튜닝 개요


### 언제 파인튜닝을 해야할까?
#### 파인튜닝할 이유
#### 파인튜닝하지 않을 이ㅠ
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