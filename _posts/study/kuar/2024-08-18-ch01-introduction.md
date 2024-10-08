---
layout: post
title: "1장. 쿠버네티스 소개"
date: 2024-08-18 17:44:00 +0900
categories: study kuar
comments: true
visible: true
---

교재: [https://www.oreilly.com/library/view/kubernetes-up-and/9781491935668/](https://www.oreilly.com/library/view/kubernetes-up-and/9781491935668/)

<br/>

## 쿠버네티스

<aside mark="💡"><strong>쿠버네티스(Kubernetes)</strong>란 컨테이너화된 애플리케이션을 배포하기 위한 오픈소스 오케스트레이터다.</aside>

쿠버네티스는 구글의 10여년의 경험을 통해 만들어졌다.

애플리케이션 지향 API(application-oriented API)를 통해 컨테이너 환경에서 신뢰성(reliable)과 확장성(scalable)을 갖춘 분산 시스템(distributed system)을 배포했던 경험이 그 기반이다.

신뢰성이란 소프트웨어가 롤아웃(rollout)되는 동안이나 그 밖의 작업 중에도 가용성(availability)를 보장하는 것이다.

확장성이란 지속적으로 증가하는 사용량을 인지해 근본적인 재설계 없이도 시스템의 용량을 늘릴 수 있는 것이다.

쿠버네티스 같은 컨테이너와 컨테이너 API를 사용하는데에는 아래와 같은 이점이 있다.

- 개발 속도
- 확장성
- 인프라 추상화
- 효율성
- 클라우드 네이티브 에코시스템

<br/>

## 속도(velocity)

높은 가용성을 보장하면서 제공할 수 있는 항목의 수로 측정한다.

컨테이너와 쿠버네티스는 가용성을 보장하면서 /빠르게 작업할 수 있는 도구를 제공하는데, 이를 가능하게 하는 핵심 개념은 다음과 같다.

- 불변성(immutability)
- 선언형 컨피규레이션(declarative configuration)
- 온라인 자가 치유 시스템(online self-healing shystem)
- 재사용 가능한 공유 라이브러리와 도구

<br/>

### 불변성의 가치

컨테이너와 쿠버네티스는 개발자들이 불변형 인프라(immutable infrastructure) 원칙을 준수하는 분산 시스템을 구축할 수 있게 도와준다.

불변형 인프라를 사용할 경우 시스템에 생성된 아티팩트(artifact)는 사용자의 수정에 의해 변경될 수 없다.

새로운 컨테이너 이미지를 빌드해 이를 컨테이너 레지스트리(container registry)로 푸시(push) 후 기존 컨테이너를 중지하고 새로운 컨테이너를 시작하는 방식이 불변형 인프라의 배포 방식이다.

불변형 인프라는 생성한 아티팩트와 생성 방법에 대한 기록을 가진다.

에러가 발생할 경우 기존 이미지를 이용해 즉시 롤백(rollback) 가능하다는 장점이 있다.

<br/>

### 선언형 컨피규레이션

쿠버네티스에서 애플리케이션을 기술하는 방식을 불변성을 확장해 적용한 것이다.

쿠버네티스의 모든 구성 요소는 시스템의 원하는 상태(desired state)를 나타낸 **선언형 컨피규에시녀 객체(declarative configuraiton object)**다.

<aside mark="💡">실제 상태(actual state)와 원하는 상태를 일치시켜주는 것이 쿠버네티스의 역할이다.</aside>

이는 명령형 컨피규레이션(imperative configuration)과 대비된다.

소스 컨트롤 시스템에 선언형 컨피규레이션을 저장하는 아이디어는 종종 IAC(Infrastructurre AS Code)라고 불린다.

최근의 깃옵스(GitOps)의 아이디어는 소스 컨트롤 시스템을 신뢰성 있는 원천 데이터(Source of Truth)로 하는 IAC의 관행을 공식화하기 시작했다.

깃옵스를 채택하면 운영 환경에 대한 변경 사항은 전적으로 깃 리포지터리(Git Repository)에 푸시를 통해 이뤄지며 자동화를 통해 클러스터에 반영된다.

<br/>

### 자가 치유 시스템

쿠버네티스는 온라인 자가 치유 시스템이다.

선언형 컨피규레이션에 정의된 원하는 상태에 이를 때까지 끊임없이 실세 상태를 변경시킨다.

예를 들어 원하는 상태로 3개의 복제본을 설정할 경우 수동으로 4번째 복제본을 생성하면 쿠버네티스는 하나의 복제본을 삭제시킨다.

반대로 복제본 하나를 삭제해 2개의 복제본을 남겨둘 경우 쿠버네티스는 새로운 복제본을 생성한다.

온라인 자가 치유 시스템은 시간과 에너지를 운영 및 유지 보수에 낭비하지 않는 대신 새로운 기능의 개발과 테스트에 집중하게 해, 개발자의 개발 속도를 높힌다.

<br/>

## 서비스와 팀의 확장

쿠버네티스는 분리된 아키텍처(decoupled architecture)를 지향해 확장성에 대한 목표를 달성한다.

<br/>

### 분리

각각의 컴포넌트들은 API와 로드밸런서를 통해 분리된다.

API는 구현자(implementer)와 소비자(consumer) 사이에 버퍼(buffer)를 제공하고, 로드밸런서는 각 서비스의 실행 중인 인스턴스 간에 버퍼를 제공한다.

로드밸런서로 컴포넌트를 분리하면 서비스의 다른 계층(layer)를 조정하거나 재구성하지 않고도 프로그램의 크기 및 용량을 늘릴 수 있기 때문에 서비스를 구성하는 프로그램을 쉽게 확장할 수 있다.

API를 통해 서버를 분리하면 각 팀은 단일 마이크로서비스(microservice)에만 집중하여 개발 팀을 쉽게 확장할 수 있다.

<br/>

### 애플리케이션과 클러스터의 손쉬운 확장

쿠버네티스 환경에서 서비스는 쿠버네티스의 불변적이고 선언적인 특성으로 쉽게 확장될 수 있다.

복제본의 수를 컨피규레이션 파일에서 수정하면 쿠버네티스가 알아서 원하는 상태에 이르게 만들어준다.

자동 확장(autoscaling)을 설정해 서비스에 대한 확장을 쿠버네티스가 자동으로 처리하게 할 수 있다.

쿠버네티스 클러스터 자체를 확장해야하는 경우도 간단하다.

클러스터 내의 많은 머신이 동일하게 간주되며, 애플리케이션 자체는 컨테이너에 의해 머신의 세부 사항들로 분리돼있기 때문이다.

클러스터에 새로운 리소스를 추가하기 위해서는 단순히 동일한 클래스의 새로운 머신을 이미지화하고 클러스터에 조인하기만 하면 된다.

쿠버네티스는 미래의 컴퓨팅 비용 예측을 단순화 할 수 있다.

각 서비스별로 갭려 머신을 프로비저닝(provisioning)하는 경우 한 팀의 머신은 다른 팀에서 사용할 수 없기 때문에 비효율적이다.

반면에 쿠버네티스를 사용할 경우 전체 팀의 성장률ㄹ을 기반으로 성장을 예측하여 효율적이다.

또한, 쿠버네티스를 사용하면 리소스의 자동 확장(수평 및 수직 모두)를 달성할 수 있다.

<br/>

### 마이크로서비스를 통한 개발 팀 확장

쿠버네티스는 분리된 마이크로서비스 아키텍처를 쉽게 구출할 수 있도록 다양한 추상화와 API를 제공한다.

<dl>
<dt>파드(pod)</dt>
<dd>컨테이너 그룹. 여러 팀이 갭라한 컨테이너 이미지를 단일 배포 단위로 그룹화할 수 있다.</dd>
<dt>쿠버네티스 서비스</dt>
<dd>로드밸런싱, 네이밍, 격리돼 있는 마이크로서비스를 위한 디스커버리(discovery) 기능을 제공한다.</dd>
<dt>네임스페이스(namespace)</dt>
<dd>격리와 접근 제어 제공. 다른 서비스와 상호작용하는 정도를 제어할 수 있다.</dd>
<dt>인그래스(ingress)</dt>
<dd>여러 마이크로서비스를 단일 외부 API로 그룹화해 사용하기 쉬운 프론트엔드(frontend)를 제공한다.</dd>
</dl>

<br/>

### 일관성과 확장에 대한 고려 사항 분리

쿠버네티스 스택에 의해 생성되는 고려 사항의 분리는 인프라의 하위 수준에 대한 일관성을 크게 향상시킨다.

애플리케이션 개발자는 컨테이너 오케스트레이션 API가 제공하는 서비스 수준 계약(SLA, Service-Level Agreement)만을 필욯로 할 뿐 SLA 달성을 위한 세부 사항은 크게 신경쓰지 않는다.

- [애플리케이션 Ops/SRE] - 쿠버네티스 API - [클러스터 Ops/SRE] - 커널 SysCall API - [커널 Ops/SRE] - CPU(x86, ARM 등) - [하드웨어 Ops/SRE]

<br/>

## 인프라 추상화

쿠버네티스 같은 애플리케이션 지향 컨테이너 API는 두 가지 구체적인 장점이 있다.

첫째, 개발자를 특정 머신으로부터 분리한다.

둘째, 클라우드 환경에서 높은 수준의 이식성(portability)을 제공한다.

쿠버네티스의 애플리케이션 지향 추상화를 기반으로하면 다양한 환경에서쉽게 빌드, 배포, 관리할 수 있다.

<br/>

## 효율성

쿠버네티스를 사용하면 여러 애플리케이션을 서로 영향을 주지 않고 동일한 머신에 배포할 수 있다.

여러 사용자의 작업을 좀 더 적은 수의 머신으로 수행할 수 있음을 의미한다.

효율성(Efficiency)는 유용한 작업의 양과 소비한 전체 에너지양의 비율로 측정할 수 있다.

쿠버네티스는 머신 클러스터 전체에 애플리케이션 배포를 자동화하는 도구를 제공해 전통적인 방식의 도구보다 높은 수준의 사용률을 보장한다.

<br/>

## 클라우드 네이티브 에코 시스템

쿠버네티스는 처음부터 확장 가능한 환경과 광범위한 커뮤니티를 기반으로 설계됐다.

이러한 설계 목표와 매우 많으 컴퓨팅 환경에서의 편재성은 쿠버네티스 도구와 서비스에 대한 활발한 대규모 에코시스템으로 이어졌다.

클라우드 네이티브 에코시스템을 활용하면 개발자는 핵심 비즈니스 로직에 집중할 수 있다.

에코시스템의 다양한 솔루션의 복잡성을 해결할 수 있는 한 가지 방법은 CNCF(Cloud Native COmputing Founcdation)의 기술 지침이다.

CNCF의 프로젝트는 3가지 단계로 나누어지는데, 이는 샌드박스, 인큐베이팅, 졸업이다.

<dl>
<dt>샌드박스</dt>
<dd>프로젝트가 아직 초기 개발 단계에 있음을 나타낸다. 채택하지 않는 것이 좋다.</dd>
<dt>인큐베이팅</dt>
<dd>채택과 운영 환경 사용을 통해 유용성과 신뢰성이 입증된 프로젝트다. 여전히 성장 중에 있다.</dd>
<dt>졸업</dt>
<dd>완전히 성숙돼 있으며 널리 채택됐다.</dd>
</dl>
