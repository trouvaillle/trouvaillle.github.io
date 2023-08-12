---
layout: post
title: "ServerHttpResponse already committed 이슈 해결"
date: 2022-09-21 11:09:00 +0900
categories: backend
comments: true
---
# 이슈

스프링 프레임워크 프로젝트에서 webflux 및 `@ControllerAdvice`를 사용할 때 아래와 같은 오류가 발생할 때가 있다.
```log
[13427a83-7917573] Error [java.lang.UnsupportedOperationException] for HTTP GET "/path", but ServerHttpResponse already committed (200 OK)
Location:org.springframework.web.server.adapter.HttpWebHandlerAdapter.handleUnresolvedError():308
```  

# 원인
ControllerAdvice에서 이미 commit된 `ServerHttpResponse`에 대해 `ReadOnlyHttpHeaders`를 변경하려 시도하는 과정에서 생기는 오류로 타임라인은 아래와 같다.  
  
1. 특정 이유<sup>1)</sup>로 컨트롤러에서 응답이 나간 체인에서 오류가 발생함  
2. `HttpWebHandlerAdapter`에 등록된 `@ControllerAdvice` 클래스의 `@ExceptionHandler` 메서드가 오류를 핸들링 시도  
3. `ServerHttpResponse`의 `ReadOnlyHttpHeaders`의 set 메서드 실행 시도  
4. `java.lang.UnsupportedOperationException` 익셉션 발생(ReadOnly)  
5. `ControllerAdvice`에서 받지 못하고 `HttpHandlerConnector`에서 오류 메시지 출력  
  
1\) 특정 이유는 인터넷에서 직접(또는 게이트웨이를 거쳐서) 트래픽을 받는 서비스의 경우 Connection Reset(브라우저 등에 의한)이 자주 발생하는데, 이 경우 해당 오류가 발생할 수 있다.  
또한 streaming을 통한 응답도 해당 이슈가 발생할 수 있다(streaming 중 익셉션 발생 시).  

# 해결
`@ControllerAdvice`에서 이미 commit된 응답에 대해 헤더를 조작하지 않는 방어 로직을 추가한다.  
```kotlin
@ControllerAdvice
class ErrorResponseHandler {
    @ExceptionHandler(Exception::class)
    fun internalServerError(e: Exception, exchange: ServerWebExchange): ResponseEntity<ApiResponse> {
        // 이미 커밋된 응답에 대해서
        if (exchange.response.isCommitted) {
            // 헤더 수정 없이 기존 응답을 내보낸다.
            return ResponseEntity.status(exchange.response.statusCode!!).build()
        }
        return ResponseEntity<ApiResponse>(ApiResponse.fail(e.message), INTERNAL_SERVER_ERROR)
    }
}
```  

# 참고 자료
[https://github.com/spring-projects/spring-framework/issues/23510#issuecomment-555971059](https://github.com/spring-projects/spring-framework/issues/23510#issuecomment-555971059)