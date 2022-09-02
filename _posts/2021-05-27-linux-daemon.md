---
layout: post
title: "리눅스에서 프로그램을 데몬으로 실행하는 방법"
date: 2021-05-27 01:35:00 -0400
categories: tip
comments: true
---

## 사용자가 로그인한 상태에만 프로그램을 백그라운드 데몬으로 실행

```bash
$ java –jar $app_jar &
```

## 사용자 로그아웃에 관계 없이 백그라운드 데몬으로 실행

```bash
$ nohup java -jar $app_jar &
```

## 데몬을 찾아서 종료

```bash
$ ps –ef | grep $app_jar
$ kill -9 $pid
```
