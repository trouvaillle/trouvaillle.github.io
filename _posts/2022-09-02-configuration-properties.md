---
layout: post
title: "Spring ConfigurationProperties"
date: 2022-09-02 17:03:00 +0900
categories: backend
comments: true
---
# ConfigurationProperties와 RefreshScope
스프링 프레임워크에서 `@ConfigurationProperties`와 `@RefreshScope` 어노테이션의 사용에 대해 알아보자.  

## ConfigurationProperties
`@ConfigurationProperties` 어노테이션이 사용된 빈은 외부화된 프로퍼티를 빈 내부로 주입받게된다.  

## RefreshScope
`@RefreshScope` 어노테이션이 사용된 빈은 lazy proxy로서 빈이 사용될 때 초기화 된다.  

## 혼용
`@ConfigurationProperties`가 사용된 빈에 `@RefreshScope`를 중복 사용할 필요가 있을까?  
결론부터 말하자면 **필요없다**.  
  
간단하게 요약하면  
`@RefreshScope`에 해당하는 빈의 재생성은 `RefreshEvent`에 trigger되고,
`@ConfigurationProperties`에 해당하는 빈의 재생성은 `EnvironmentChangeEvent`에 trigger되는데
`RefreshEvent`는 `EnvironmentChangeEvent`를 publish하기 때문에
함께 사용한다면 `@RefreshScope`가 우선된다.  
  
이러한 용례는 동시성 이슈 처리를 위해 `RefreshEvent`에서 선제적으로 추가 작업이 필요할 경우 사용될 수 있다.  

## 코드
### `ConfigurationPropertiesRebinder`  
아래 코드에서 `@ConfigurationProperties`이 사용된 빈이 `EnvironmentChangeEvent`의 발생에 따라 rebinding되는 것을 볼 수 있다.  
```java
package org.springframework.cloud.context.properties;
// ...
@Component
public class ConfigurationPropertiesRebinder
        implements ApplicationContextAware, ApplicationListener<EnvironmentChangeEvent> {
    // ...
    @Override
    public void onApplicationEvent(EnvironmentChangeEvent event) {
        if (this.applicationContext.equals(event.getSource())
            // Backwards compatible
            || event.getKeys().equals(event.getSource())) {
                rebind();
        }
    }

    public void rebind() {
        // ...
        for (String name : this.beans.getBeanNames()) {
            rebind(name);
        }
    }

    public boolean rebind(String name) {
        // ...
            this.applicationContext.getAutowireCapableBeanFactory().destroyBean(bean);
            this.applicationContext.getAutowireCapableBeanFactory().initializeBean(bean, name);
        // ...
    }
    // ...
}
```  

### `RefreshListener`
아래 코드에서 `RefreshRemoteApplicationEvent` 발생 시 `ContextRefresher`의 refresh 메서드를 호출하는 것을 볼 수 있다.  
```java
package org.springframework.cloud.bus.event;
// ...
public class RefreshListener implements ApplicationListener<RefreshRemoteApplicationEvent> {
    // ...
    @Override
    public void onApplicationEvent(RefreshRemoteApplicationEvent event) {
        // ...
            Set<String> keys = this.contextRefresher.refresh();
        // ...
    }
    // ...
}
```  

### `ContextRefresher`
아래 코드에서 `ContextRefresher`의 refresh 메서드 호출 시 `EnvironmentChangeEvent`를 발행하는 것을 볼 수 있다.  
```java
package org.springframework.cloud.context.refresh;
// ...
public abstract class ContextRefresher {
    // ...
    public synchronized Set<String> refresh() {
        Set<String> keys = refreshEnvironment();
        // ...
    }

    public synchronized Set<String> refreshEnvironment() {
        // ...
        this.context.publishEvent(new EnvironmentChangeEvent(this.context, keys));
        // ...
    }
    // ...
}
```  

## 참고
[https://gist.github.com/dsyer/a43fe5f74427b371519af68c5c4904c7](https://gist.github.com/dsyer/a43fe5f74427b371519af68c5c4904c7)  
[https://soshace.com/spring-cloud-config-refresh-strategies/](https://soshace.com/spring-cloud-config-refresh-strategies/)  