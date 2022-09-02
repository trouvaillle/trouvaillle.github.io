---
layout: post
title: "Semantic Versioning"
date: 2022-04-10 15:35:00 +0900
categories: software-engineering
comments: true
---
### 의미
**Semantic Versioning**는 유의적 버전으로 번역하고,  
정식 명세를 통해 의존성 관리의 편의성을 제공하기 위한 버전 표기에 대한 규칙이다.  

### 요약
버전을 주(major).부(minor).수(patch) 숫자로 하고:  

  기존 버전과 호환되지 않게 API가 바뀌면 “주(主) 버전”을 올리고,  
  기존 버전과 호환되면서 새로운 기능을 추가할 때는 “부(部) 버전”을 올리고,  
  기존 버전과 호환되면서 버그를 수정한 것이라면 “수(修) 버전”을 올린다.  

주.부.수 형식에 정식배포 전 버전이나 빌드 메타데이터를 위한 라벨을 덧붙이는 방법도 있다.  

``` r
{major}.{minor}.{patch}-{pre-release}+{build-metadata}
```

### 예시
``` r
1.0.0-beta+exp.sha.5114f85
```

| value           | meaning        |
| --------------- | -------------- |
| 1               | major          |
| 0               | minor          |
| 0               | patch          |
| beta            | pre-release    |
| exp.sha.5114f85 | build-metadata |  


### 깃헙 레포
[https://github.com/semver/semver](https://github.com/semver/semver)  

### 영어 원문
[https://github.com/semver/semver/blob/master/semver.md](https://github.com/semver/semver/blob/master/semver.md)  
[https://semver.org/](https://semver.org/)  

### 한글 번역본
[https://semver.org/lang/ko/](https://semver.org/lang/ko/)  
