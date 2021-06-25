---
title: "Elasticstack Quickstart"
date: 2021-06-25 21:28:04 +0900
categories: Elasticsearch
comments: true
---

# 직접 설치
## Ubuntu에 설치

https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html

## 설정
```console
$ sudo vi /etc/elasticsearch/elasticsearch.yml
```
맨 마지막 줄에 `network.host: localhost` 추가

## 실행

서비스 작업 | 권장 | 다른 방법<sup>1)</sup>
-- | -- | --
시작 | `sudo systemctl start elasticsearch` | `sudo service elasticsearch start`
중지 | `sudo systemctl stop elasticsearch` | `sudo service elasticsearch stop`
상태 확인 | `sudo systemctl status elasticsearch` | `sudo service elasticsearch status`

<sup>1) wsl2와 같이 `systemctl` 사용이 불가할 때</sup>

## 접속

http://localhost:9200

# 도커를 통해 설치
https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
https://www.elastic.co/guide/en/logstash/current/docker.html
https://www.elastic.co/guide/en/logstash/current/docker-config.html
https://www.elastic.co/guide/en/kibana/current/docker.html

## Elasticserach

```console
docker network create elastic
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.13.2
docker run --name es01-test --net elastic -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.13.2

```

## Logstash
```console
docker pull docker.elastic.co/logstash/logstash:7.13.2
docker run --name log01-test --net elastic --rm -it -v ~/pipeline/:/usr/share/logstash/pipeline/ docker.elastic.co/logstash/logstash:7.13.2

```

## Kibana
```console
docker pull docker.elastic.co/kibana/kibana:7.13.2
docker run --name kib01-test --net elastic -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://es01-test:9200" docker.elastic.co/kibana/kibana:7.13.2

```

## 접속

* Elasticsearch: http://localhost:9200
* Kibana: http://localhost:5601
