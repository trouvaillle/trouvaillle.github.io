---
title: "Elasticsearch Quickstart"
date: 2021-06-25 21:28:04 +0900
categories: Elasticsearch
comments: true
---

# 설치
## Ubuntu
https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html

# 설정
```console
$ sudo vi /etc/elasticsearch/elasticsearch.yml
```
맨 마지막 줄에 `network.host: localhost` 추가

# 실행

서비스 작업 | 권장 | 다른 방법<sup>1)</sup>
-- | -- | --
시작 | `$ sudo systemctl start elasticsearch` | `$ sudo service elasticsearch start`
중지 | `$ sudo systemctl stop elasticsearch` | `$ sudo service elasticsearch stop`
상태 확인 | `$ sudo systemctl status elasticsearch` | `$ sudo service elasticsearch status`

<sup>1) wsl2와 같이 `systemctl` 사용이 불가할 때</sup>

# 접속
http://localhost:9200

