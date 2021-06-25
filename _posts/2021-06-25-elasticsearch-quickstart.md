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
## 서비스 시작
### 권장
```console
$ sudo systemctl start elasticsearch # 권장
```
### wsl2와 같이 `systemctl` 사용이 불가할 때
```console
$ sudo service elasticsearch start
```

## 서비스 상태 확인
### 권장
```console
$ systemctl status elasticsearch # 권장
```
### wsl2와 같이 `systemctl` 사용이 불가할 때
```console
$ service elasticsearch status
```
