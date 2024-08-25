---
layout: post
title: "How to install Kind to study kubernetes"
date: 2024-08-19 23:44:00 +0900
categories: backend
comments: true
visible: true
---
## install and initialize podman
```sh
brew install podman
podman machine init --cpus=4 --memory=8096 --disk=50
podman machine start
```

## setup a kind cluster

```sh
export KIND_EXPERIMENTAL_PROVIDER=podman
kind create cluster --wait 5m
```

```sh
using podman due to KIND_EXPERIMENTAL_PROVIDER
enabling experimental podman provider
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.31.0) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Thanks for using kind! 😊
```

