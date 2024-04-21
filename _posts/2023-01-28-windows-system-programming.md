---
layout: post
title: "Windows System Programming"
date: 2023-01-28 19:14:00 +0900
categories: backend
comments: true
---
# 윈도우즈 시스템 프로그래밍
1. 컴퓨터 시스템의 주요 구성요소
- CPU, Cache, Main Memory, Persistence(File I/O)
- Domain
  - Computer Architecture: CPU, Cache
  - Operating System: Main Memory,Persistance
- CPU: ALU(Arithmetic Logic Unit), Control Unit, Register Set, Bus Interface
  - ALU:
  - Control Unit:
  - Register Set:
  - Bus Interface: 
- Program
  - Instructions + Data
- 프로그램의 실행 순서
  - Stored Program Conecept:
    - Von Neumann Architecture
    - Fetch -> Decode -> Execution
  - Persistence -> I/O BUS -> Bus Interface -> Main Memory -> I/O BUS -> Bus Interface -> Register Set -> Control Unit -> ALU -> Bus Interface -> I/O BUS -> Display
- Clock Pulse
  - 동작 타이밍: 클럭 발생기의 클럭
  - 필요성: 요소들의 동기화