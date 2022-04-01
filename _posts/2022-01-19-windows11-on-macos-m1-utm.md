---
layout: post
title: "Windows 11을 macOS M1 가상머신으로 설치하기"
date: 2021-06-25 21:28:04 +0900
categories: Tip
comments: true
---

## 환경

- ARM64를 사용하는 macOS(M1, M1 Pro, M1 Max 등)

## 준비물

- [UTM for Mac](https://mac.getutm.app/) 및 [SPICE Guest Tools and QEMU Drivers (Windows)](https://mac.getutm.app/support/)
- [Windows Client ARM64 Insider Preview](https://www.microsoft.com/en-us/software-download/windowsinsiderpreviewarm64)
- [Homebrew](https://brew.sh/index_ko)

## 과정

1. qemu-image를 통해 다운받은 preview 이미지를 qcow2 포멧으로 변환

```sh
brew install qemu
qemu-img convert -p -O qcow2 ${SOURCE} ${TARGET}
# SOURCE=*.vhdx
# TARGET=*.qcow2
```

2. UTM에 가상머신 생성

| Menu   | Field           | Value                                   |
| ------ | --------------- | --------------------------------------- |
| System | Architecture    | ARM64 (aarch64)                         |
| System | System          | QEMU 5.2 ARM Virtual Machine (virt-5.2) |
| System | CPU (고급 설정) | Default                                 |
| Drive  | Drive           | \*.qcow2 / NVMe                         |
| Drive  | Drive           | Add Removable Disk / USB                |

3. Windows 11 설정  
   Install without Internet

4. SPICE Guest Tools 설치  
   Removable disk에 tools iso 삽입 후 설치(게스트)
