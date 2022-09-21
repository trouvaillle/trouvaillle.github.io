---
layout: post
title: "Elasticsearch Hot-warm architecture"
date: 2022-05-30 15:49:00 +0900
categories: database
comments: true
---
# 일렉스틱 서치에서 핫-웜 아키텍쳐 적용하기

## 핫-웜 아키텍쳐란?

[https://www.elastic.co/kr/blog/hot-warm-architecture-in-elasticsearch-5-x](https://www.elastic.co/kr/blog/hot-warm-architecture-in-elasticsearch-5-x)  

데이터 저장 노드를 핫과 웜 2가지 타입으로 나누고  
핫은 SSD와 같은 빠른 i/o를 통해 빠른 검색을 위한 인덱스들을 저장하고  
웜은 HDD와 같은 느린 i/o를 통해 느린 검색을 위한 인덱스들을 저장하는 아키텍쳐이다.  
  
노드의 핫/웜 지정은 아래와 같은 두가지 방식으로 가능하다.  
1. elasticsearch.yml 설정 파일에 `node.attr.box_type: hot`(또는 `warm`)을 지정  
2. 다음 명령어로 노드 실행: `./bin/elasticsearch -Enode.attr.box_type=hot`(또는 `warm`)
  
  
## typeless 노드에서 핫-웜 아키텍쳐로 전환하기

nginx의 accesslog를 저장하고 있는 상황이라고 하자.  
핫-웜 아키텍쳐 적용은 아래 두 가지 단계로 이루어진다.  
  
### 1. 기존 인덱스들의 노드 타입을 지정  

```sh
PUT /accesslog.*/_settings
{
  "settings" : {
    "index.routing.allocation.require.boxtype" : "hot"
  }
}
```  
\*(wildcard) 사용으로 모든 accesslog.로 시작하는 인덱스가 업데이트 된다.  
  

### 2. Index Template 적용으로 새로 생성되는 인덱스에 기본 설정 추가

```sh
PUT /_template/accesslog_template
{
  "index_patterns" : [
      "accesslog.*"
  ],
  "settings" : {
    "index.routing.allocation.require.boxtype" : "hot"
  }
}
```  
템플릿 이름은 다르게 설정해도 된다.

### 3. Index Lifecycle Management Policy 설정

[https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm-put-lifecycle.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm-put-lifecycle.html)  
일정 기간이 지나면 warm 노드로 이동하도록 설정한다.  

```sh
PUT _ilm/policy/warm-1-months-retention-3months
{
  "policy" : {
    "_meta" : {
      "description" : "warm-1-months-retention-3months",
      "project" : {
        "name" : "myProject",
        "department" : "myDepartment"
      }
    },
    "phases" : {
      "delete" : {
        "max_age" : "94d"
      },
      "hot" : {
        "cooling" : {
          "max_age" : "33d"
        }
      },
      "warm": {}
    }
  }
}
```