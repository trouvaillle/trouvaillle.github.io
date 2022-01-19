---
title: "Windows 11을 macOS M1 가상머신으로 설치하기"
date: 2021-06-25 21:28:04 +0900
categories: Elasticsearch
comments: true
---

# Windows 11을 macOS M1의 가상머신으로 설치하기
## 환경
- ARM64를 사용하는 macOS(M1, M1 Pro, M1 Max 등)
## 준비물
- [UTM for Mac](https://mac.getutm.app/) 및 [SPICE Guest Tools and QEMU Drivers (Windows)](https://mac.getutm.app/support/)
- [Windows Client ARM64 Insider Preview](https://www.microsoft.com/en-us/software-download/windowsinsiderpreviewarm64)
- [Homebrew](https://brew.sh/index_ko)

## 과정
1. qemu-image를 통해 다운받은 preview 이미지를 qcow2 포멧으로 변환
```
brew install qemu
qemu-image convert -p -O qcow2
```






