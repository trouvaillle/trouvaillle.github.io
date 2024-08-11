---
layout: post
title: "CentOS yum error"
date: 2024-08-05 11:40:00 +0900
categories: tip
comments: true
visible: true
---
How to deal with CentOS yum error

## Change repos

```sh
sudo vi /etc/yum.repos.d/CentOS-Base.repo
```

- Add below lines.

```ini
[centos-sclo-rh]
name=CentOS-6.10 - SCLo rh
baseurl=http://vault.centos.org/centos/6.10/sclo/$basearch/rh/
gpgcheck=1
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-SCLo

[centos-sclo-sclo]
name=CentOS-6.10 - SCLo sclo
baseurl=http://vault.centos.org/centos/6.10/sclo/$basearch/sclo/
gpgcheck=1
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-SIG-SCLo
```
