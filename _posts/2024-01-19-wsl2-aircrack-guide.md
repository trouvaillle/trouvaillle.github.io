---
layout: post
title: "WSL2 aircrack guide"
date: 2024-01-18 01:38:00 +0900
categories: tip
comments: true
visible: false
---
### WSL2 aircrack guide
1. get version of wsl
```console
wsl -l -v
```

2. install usbipd
[https://github.com/dorssel/usbipd-win](https://github.com/dorssel/usbipd-win)

3. bind device to wsl
```console
usbipd --help
usbipd list
usbipd bind --busid=<BUSID>
usbipd attach --wsl --busid=<BUSID>
# detach
usbipd detach --all
```

4. 