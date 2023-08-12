---
layout: post
title: "Kotlin에서 ObjectMapper 사용 시 주의사항"
date: 2023-02-14 01:51:00 +0900
categories: backend
comments: true
---
# TL;DR
Kotlin에서 `ObjectMapper` 사용 시 `jacksonObjectMapper` 객체를 생성하자.

# Problem
Kotlin에서 data class의 경우 Java의 Lombok처럼 getter와 setter, 그리고 equals, hashcode, copy를 자동 생성해줍니다.

아래와 같은 data class가 있을 경우 Java의 `ObjectMapper`는 적용된 annotation을 찾을 수 없습니다.

```kotlin
data class Fruit(
    @JsonProperty("apple")
    val orange: String = "sweet"
)
```

- `ObjectMapper().writeValueAsString(Fruit())`의 결과
```js
{
    "orange": "sweet"
}
```

하지만 WebClient 사용 시 위 `Fruit` 인스턴스의 annotation은 정상 적용됩니다.

- `wiretap`을 적용한 `WebClient` 호출의 결과
```js
{
    "apple": "sweet"
}
```

무슨 일이 일어나고 있는 걸까요?

# Cause
비밀은 [Jackson2ObjectMapperBuilder](https://github.com/spring-projects/spring-framework/blob/main/spring-web/src/main/java/org/springframework/http/converter/json/Jackson2ObjectMapperBuilder.java#L100)에 있습니다.

DefaultWebClient의 경우 `Jackson2ObjectMapperBuilder`에서 제공된 `ObjectMapper`를 디폴트로 사용 중이어서 해당 annotation을 처리할 수 있는 [KotlinModule](https://github.com/FasterXML/jackson-module-kotlin)이 적용되어 있는데요.

`Jackson2ObjectMapperBuilder`는 객체 생성 시 [KotlinModule을 자동 등록](https://github.com/spring-projects/spring-framework/blob/main/spring-web/src/main/java/org/springframework/http/converter/json/Jackson2ObjectMapperBuilder.java#L878)하는 과정을 거칩니다.

따라서 일반 `ObjectMapper()`로 생성된 객체와 다른 양상을 보일 수 밖에 없습니다.

# Solution
[KotlinModule](https://github.com/FasterXML/jackson-module-kotlin#usage)의 README.md에서 설명하는 것처럼 `jacksonObjectMapper()`를 사용하면 해당 문제를 쉽게 해결할 수 있습니다.

수동으로 해당 모듈을 등록하려면 `ObjectMapper().registerKotlinModule()`와 같이 생성할 수 있습니다.

`KotlinModule`에 의존적이지 않은 코드를 생성하려면 `@field:`나 `@get:`과 같은 [Kotlin annotation prefix](https://kotlinlang.org/docs/annotations.html#annotation-use-site-targets)를 이용해서 기존 `ObjectMapper`와 호환되는 코드를 생성할 수도 있습니다.

- `KotlinModule`에 의존적이지 않은 코드

```kotlin
data class Fruit(
    @field:JsonProperty("apple")
    val orange: String = "sweet"
)
```