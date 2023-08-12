---
layout: post
title: "Aerospike Compatibility"
date: 2022-08-26 18:35:00 +0900
categories: database
comments: true
---
# Aerospike 호환성
## 이슈
aerospike 최신 버전을 조합하면 아래와 같은 오류가 발생한다.  
```log
java.lang.NoSuchMethodError: com.aerospike.client.query.Filter.equal(Ljava/lang/String;Ljava/lang/String;)Lcom/aerospike/client/query/Filter;
        at org.springframework.data.aerospike.query.Qualifier.asFilter(Qualifier.java:201)
        at org.springframework.data.aerospike.query.StatementBuilder.updateStatement(StatementBuilder.java:68)
        at org.springframework.data.aerospike.query.StatementBuilder.build(StatementBuilder.java:43)
        at org.springframework.data.aerospike.query.ReactorQueryEngine.select(ReactorQueryEngine.java:81)
        at org.springframework.data.aerospike.core.ReactiveAerospikeTemplate.findAllRecordsUsingQuery(ReactiveAerospikeTemplate.java:512)
```

## 해결
호환성 표: [https://github.com/aerospike-community/spring-data-aerospike](https://github.com/aerospike-community/spring-data-aerospike)  
아래 설정은 spring boot 2.5.3 ~ 2.7.3과 호환된다.  
최신 버전의 의존성들로 조합하면 오류가 난다.  
그냥 redis 쓰자.  
```kt
// https://mvnrepository.com/artifact/com.aerospike/spring-data-aerospike
implementation("com.aerospike:spring-data-aerospike:3.1.0")
// https://mvnrepository.com/artifact/com.aerospike/aerospike-reactor-client
implementation("com.aerospike:aerospike-reactor-client:5.0.7")
// https://mvnrepository.com/artifact/com.aerospike/aerospike-client
implementation("com.aerospike:aerospike-client:5.1.7")
```