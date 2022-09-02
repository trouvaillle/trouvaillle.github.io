---
layout: post
title: "Jenkins Docker Version Upgrade"
date: 2022-05-02 15:35:00 +0900
categories: tip
comments: true
---
### 도커 상에서 돌아가는 젠킨스의 버전 업그레이드 하기
1. 젠킨스 도커 쉘에 접근
``` sh
docker container exec -u 0 -it jenkins bash
```  

2. 원하는 버전의 젠킨스 war 이미지를 다운로드
[https://www.jenkins.io/download/](https://www.jenkins.io/download/)에서 최신 버전 확인  
``` sh
wget https://get.jenkins.io/war-stable/2.332.2/jenkins.war
# https 오류나면 아래로 시도
wget http://get.jenkins.io/war-stable/2.332.2/jenkins.war
```  

3. 버전 교체 시 탐색하는 폴더로 이동
``` sh
mv ./jenkins.war /usr/share/jenkins
```  

4. 파일 소유자 그룹 jenkins로 변경
``` sh
chown jenkins:jenkins /usr/share/jenkins/jenkins.war
```

5. 재시작
``` sh
exit
docker restart jenkins
```