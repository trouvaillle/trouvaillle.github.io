---
layout: post
title: "Docker로 Aerospike를 빠르게 학습하기"
date: 2022-03-18 22:59:00 +0900
categories: Database
comments: true
---

# 목표

docker contatiner 형태로 aeropsike server를 3대 띄우고  
clustering 후 data를 CRUD하고, 새로운 data를 저장한다.  
그 후 한 개의 node를 내리고 새로운 node로 교체한다.  
이 과정에서 data는 보존되어야 한다.

# 단계

## 1. docker image 준비

### **aerospike server**: community edition [링크](https://hub.docker.com/_/aerospike)

- linux/amd64

```sh
docker pull aerospike:ce-5.7.0.11
```

- linux/arm64  
  arm64 버전은 아직 제작되지 않아서 다른 amd64 이미지 사용

```sh
docker pull aerospike/aerospike-server:latest
```

### **amc**: aerospike mangement console [링크](https://hub.docker.com/r/aerospike/amc)

aerospike cluster monitoring 도구

```sh
docker pull aerospike/amc
```

### **aerospike tools** [링크](https://hub.docker.com/r/aerospike/aerospike-tools)

aerospike cluster에 접속하여 data를 CRUD 할 수 있는 도구

```sh
docker pull aerospike/aerospike-tools:latest
```

## 2. amc 실행

```sh
docker run --rm -tid -p 8081:8081 --name aerospike-console aerospike/amc
```

## 3. aerospike server 실행

| 컨테이너 이름 | 외부 노출 포트 | 내부 포트 |
| ------------- | -------------- | --------- |
| aerospike1    | 3000-3002      | 3000-3002 |
| aerospike2    | 3010-3012      | 3000-3002 |
| aerospike3    | 3020-3022      | 3000-3002 |

```sh
docker run -tid --name aerospike1 -p 3000-3002:3000-3002 aerospike:ce-5.7.0.11
docker run -tid --name aerospike2 -p 3010-3012:3000-3002 aerospike:ce-5.7.0.11
docker run -tid --name aerospike3 -p 3020-3022:3000-3002 aerospike:ce-5.7.0.11
```

## 4. aerospike server ip 확인

[`asinfo -v service`](https://docs.aerospike.com/reference/info/index.html#service)를 이용한다.

> IP address and server port for this node, expected to be a single address/port per node, may be multiple address if this node is configured to listen on multiple interfaces (typically not advised).

```sh
docker exec -ti aerospike1 asinfo -v service
docker exec -ti aerospike2 asinfo -v service
docker exec -ti aerospike3 asinfo -v service
```

## 5. clustering

[`asinfo -v tip`](https://docs.aerospike.com/reference/info/index.html#tip)을 이용한다.

> Add hostname to seed list for mesh-mode heartbeats.
>
> ```
> tip:host=HOST;port=MESH-PORT
> ```

```sh
docker exec -ti aerospike1 asinfo -v 'tip:host=<IP ADDRESS from aerospike2>;port=3002'
docker exec -ti aerospike1 asinfo -v 'tip:host=<IP ADDRESS from aerospike3>;port=3002'
```

ok 문구가 뜨면 됨

ex.

```sh
docker exec -ti aerospike1 asinfo -v 'tip:host=172.17.0.4;port=3002'
docker exec -ti aerospike1 asinfo -v 'tip:host=172.17.0.5;port=3002'
```

## 6. 연결 확인

```sh
docker exec -ti aerospike1 asadm
```

```sh
Seed:        [('127.0.0.1', 3000, None)]
Config_file: /root/.aerospike/astools.conf, /etc/aerospike/astools.conf
Aerospike Interactive Shell, version 2.4.0

Found 3 nodes
Online:  172.17.0.3:3000, 172.17.0.5:3000, 172.17.0.4:3000

Admin>
```

### 7. amc에서 확인

http://localhost:8081 접속 후 aerospike1 컨테이너의 ip와 port 입력  
ex. 172.17.0.3:3000

![naver_acceptance](https://github.com/trouvaillle/trouvaillle.github.io/blob/master/contents/2022-03-18-aerospike-docker-quickstart/amc.png?raw=true)
Nodes 항목에서 3개가 up 되어있으면 ok

### 8. aerospike tools로 CRUD

#### aerospike tools 실행

```sh
docker run -ti --name aerospike-tools --link aerospike1:aerospike-tools aerospike/aerospike-tools aql -h <IP ADDRESS from aerospike1> --no-config-file
```

ex.

```sh
docker run -ti --name aerospike-tools --link aerospike1:aerospike-tools aerospike/aerospike-tools aql -h 172.17.0.3:3000 --no-config-file
```

#### namespaces 조회

```sh
aql> show namespaces
+------------+
| namespaces |
+------------+
| "test"     |
+------------+
[172.17.0.3:3000] 1 row in set (0.003 secs)

+------------+
| namespaces |
+------------+
| "test"     |
+------------+
[172.17.0.5:3000] 1 row in set (0.004 secs)

+------------+
| namespaces |
+------------+
| "test"     |
+------------+
[172.17.0.4:3000] 1 row in set (0.006 secs)

OK
```

#### insert(create)

```sh
aql> insert into test.pineapple (PK, banana, mango) VALUES ('key1', 911, 'cheese')
OK, 1 record affected.
```

#### select(read)

```sh
aql> select * from test.pineapple where PK = 'key1'
+--------+----------+
| banana | mango    |
+--------+----------+
| 911    | "cheese" |
+--------+----------+
1 row in set (0.001 secs)

OK
```

#### insert(update)

```sh
aql> insert into test.pineapple (PK, apple, melon) VALUES ('key1', 'baguette', 114)
OK, 1 record affected.

aql> select * from test.pineapple where PK = 'key1'
+--------+----------+------------+-------+
| banana | mango    | apple      | melon |
+--------+----------+------------+-------+
| 911    | "cheese" | "baguette" | 114   |
+--------+----------+------------+-------+
1 row in set (0.000 secs)

OK
```

#### delete(delete)

```sh
aql> delete from test.pineapple where PK = 'key1'
OK, 1 record affected.
```

#### show sets

```sh
aql> insert into test.pineapple (PK, banana, mango) VALUES ('key1', 911, 'cheese')
OK, 1 record affected.

aql> show sets
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "0"     | "0"               | "pineapple" | "false"      | "0"      | "0"               | "0"               | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.5:3000] 1 row in set (0.002 secs)

+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "1"     | "0"               | "pineapple" | "false"      | "0"      | "70"              | "112"             | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.4:3000] 1 row in set (0.004 secs)

+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "1"     | "0"               | "pineapple" | "false"      | "0"      | "70"              | "112"             | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.3:3000] 1 row in set (0.006 secs)

OK
```

3개의 node 중 object 갯수가 1인 node가 2개 존재  
`replication factor: 2`가 기본 설정이기 때문  
`replication factor`는 네임스페이스 별로 설정되며, 설정 변경 시
**클러스터 전체 재시작**이 필요하다. [출처](https://discuss.aerospike.com/t/changing-replication-factor/4733)

### 9. node 삭제

#### tip-clear

aql 아닌 일반 terminal에서 진행  
이 경우 object가 존재하는 aerospike3 node를 제거한다.

[`asinfo -v tip-clear`](https://docs.aerospike.com/reference/info/index.html#tip-clear)를 이용한다.

> Clear configured hostname(s) from seed list for mesh-mode heartbeats. Configured hostname(s) means the hostname(s) from config file or added via the tip command. Useful in the case of repurposing a node from a live cluster.
>
> ```
> tip-clear:host-port-list=Node1:3002,Node2:3002,...
> ```

```
docker exec -ti aerospike1 asinfo -v 'tip-clear:host-port-list=<IP ADDRESS from aerospike3>:3002'
```

ex.

```
docker exec -ti aerospike1 asinfo -v 'tip-clear:host-port-list=172.17.0.5:3002'
```

aql에서

```sh
aql> show sets
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "1"     | "0"               | "pineapple" | "false"      | "0"      | "70"              | "112"             | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.3:3000] 1 row in set (0.001 secs)

+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "0"     | "0"               | "pineapple" | "false"      | "0"      | "0"               | "0"               | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.5:3000] 1 row in set (0.002 secs)

+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| disable-eviction | ns     | index_populating | objects | stop-writes-count | set         | enable-index | sindexes | memory_data_bytes | device_data_bytes | truncate_lut | tombstones |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
| "false"          | "test" | "false"          | "1"     | "0"               | "pineapple" | "false"      | "0"      | "70"              | "112"             | "0"          | "0"        |
+------------------+--------+------------------+---------+-------------------+-------------+--------------+----------+-------------------+-------------------+--------------+------------+
[172.17.0.4:3000] 1 row in set (0.003 secs)

OK
```

aerospike3 node에서 aerospike1 node로 object가 이동한 것을 볼 수 있음

#### remove container

```
$ docker exec -it aerospike3 /bin/bash
$ service aerospike stop #asd에선 안됨
$ exit
$ docker stop aerospike3
$ docker rm aerospike3
```

#### add new node

```
$ docker run -tid --name aerospike4 -p 3030-3032:3000-3002 aerospike:ce-5.7.0.11
$ docker exec -ti aerospike4 asinfo -v service
$ docker exec -ti aerospike1 asinfo -v 'tip:host=172.17.0.5;port=3002'
$ docker exec -ti aerospike1 asinfo -v 'services-alumni'
$ docker exec -ti aerospike1 asadm
```

# 결론

node 추가와 제거 시 replication factor(default: 2)에 따라 object는 복제와 삭제가 이루어진다.  
즉, node가 1개일 때 새로운 노드가 추가되면 object가 master/replica 한 쌍으로 복사되며,  
세번째 노드가 추가되면 아무 일도 일어나지 않는다.  
만약 첫번째 노드를 내리고, 새로운 네번째 노드를 올리면 네번째 노드에 replica가 형성된다.  
첫번째 노드를 다시 올리면 존재하던 object가 삭제되고,  
두번째와 네번째 노드에 master/replica object가 존재하게 된다.
