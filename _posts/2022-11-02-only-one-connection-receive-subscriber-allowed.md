---
layout: post
title: "Solving the 'Only one connection receive subscriber allowed' issue"
date: 2022-11-02 22:48:00 +0900
categories: backend
comments: true
---
# Introduction
An exception is thrown like below when using [Spring WebFlux](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html) and [WebClient](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/reactive/function/client/WebClient.html).  
`Exception:java.lang.IllegalStateException: Only one connection receive subscriber allowed.`  
We will investigate the issue deeply and find out how to resolve the problem.  

# Problem
```log
Exception:java.lang.IllegalStateException: Only one connection receive subscriber allowed.
  at reactor.netty.channel.FluxReceive.startReceiver(FluxReceive.java:182)
  at reactor.netty.channel.FluxReceive.subscribe(FluxReceive.java:143)
  at reactor.netty.ByteBufFlux.subscribe(ByteBufFlux.java:340)
  ...
  at reactor.netty.channel.FluxReceive.startReceiver(FluxReceive.java:167)
  at reactor.netty.channel.FluxReceive.subscribe(FluxReceive.java:143)
  at reactor.netty.ByteBufFlux.subscribe(ByteBufFlux.java:340)
  ...
  at reactor.core.publisher.FluxRetryWhen$RetryWhenMainSubscriber.onNext(FluxRetryWhen.java:174)
  ...
  at reactor.netty.http.client.HttpClientConnect$HttpIOHandlerObserver.onStateChange(HttpClientConnect.java:414)
  at reactor.netty.ReactorNetty$CompositeConnectionObserver.onStateChange(ReactorNetty.java:671)
  at reactor.netty.resources.DefaultPooledConnectionProvider$DisposableAcquire.onStateChange(DefaultPooledConnectionProvider.java:183)
  at reactor.netty.resources.DefaultPooledConnectionProvider$PooledConnection.onStateChange(DefaultPooledConnectionProvider.java:439)
  at reactor.netty.http.client.HttpClientOperations.onInboundNext(HttpClientOperations.java:637)
  ...
```

When using [Spring WebFlux](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html) and [WebClient](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/reactive/function/client/WebClient.html), sometimes the above exception is thrown.
I wonder about WHEN the exception is thrown and HOW to solve this problem.  
I thought this is a [Reactor Netty](https://projectreactor.io/docs/netty/release/reference/index.html) issue and I couldn't solve the problem unless the [Reactor Netty](https://projectreactor.io/docs/netty/release/reference/index.html) contributers fix the issue, because there are a lot of references to `reactor.netty` in the stack trace.  
But I couldn't find anywhere that answers HOW to fix the problem.  

I followed the stack trace backward from the error log, and I found the solution.  
Before we look at the solution, let's check out what actually happens.  

# Where is the exception thrown?
In the stacktrace, we can notice that it ends at `reactor.netty.channel.FluxReceive` class' `startReceiver` method.  
When we look into the method, we can see that:  
```java
package reactor.netty.channel;
...
final class FluxReceive extends Flux<Object> implements Subscription, Disposable {
  final void startReceiver(CoreSubscriber<? super Object> s) {
    if (once == 0 && ONCE.compareAndSet(this, 0, 1)) {
      ...
    }
    else {
      if (inboundDone && getPending() == 0) {
        ...
      }
      else {
        ...
        // There is the LOG!
        Operators.error(s,
          new IllegalStateException(
            "Only one connection receive subscriber allowed."));
      }
    }
  }
  ...
}
``` 

Then, who calls `startReciver` method?  
We can trace back the stack trace, and get the order how the error occurs.  
  
1. `reactor.netty.http.client.HttpClientConnect::connect`  
2. `reactor.netty.http.client.HttpClientConnect.MonoHttpConnect::subscribe` ⚠️ retryWhen  
3. `reactor.netty.http.client.HttpClientConnect.HttpIOHandlerObserver::onStateChange`  
4. `reactor.netty.channel.FluxReceive::subscribe`  
5. `reactor.netty.channel.FluxReceive::startReceiver` ⚠️ exception thrown  
  
Let's think about what the error message say.  
What does it mean "Only one connection receive subscriber allowed."?  
We can know that there must have been more than two subscriptions on the same reactor chain.  
Also, we know when the multiple subscriptions happens. It is Reactor's `retry` method.  
When we see the stack trace above, we can know that there was a `retryWhen` method in somewhere.  
I could find where the `retryWhen` method is used, and it was 2. `reactor.netty.http.client.HttpClientConnect.MonoHttpConnect::subscribe`.  
Let's look closer to that method.  

```java
package reactor.netty.http.client;
...
class HttpClientConnect extends HttpClient {
  static final class MonoHttpConnect extends Mono<Connection> {
    @Override
    @SuppressWarnings("deprecation")
    public void subscribe(CoreSubscriber<? super Connection> actual) {
      HttpClientHandler handler = new HttpClientHandler(config);

      Mono.<Connection>create(sink -> {
        HttpClientConfig _config = config;
        ...
        ConnectionObserver observer =
          new HttpObserver(sink, handler)
            .then(_config.defaultConnectionObserver())
            .then(_config.connectionObserver())
            // no. 3 on the above list
            .then(new HttpIOHandlerObserver(sink, handler));
        ...
        _config.connectionProvider()
          .acquire(_config, observer, handler, resolver)
          .subscribe(new ClientTransportSubscriber(sink));
        // There is the "retryWhen" method!
      }).retryWhen(Retry.indefinitely().filter(handler))
        .subscribe(actual);
    }
    ...
  }
  ...
}
```  

`RetryWhen` is only to be triggered when the `handler` allows.  
`reactor.util.retry.RetrySpec` accepts the only one argument whose type is `Predicate`.  
`Predicate` interface has `boolean test(T t)` method, and let's find that in the `handler`.  

```java
package reactor.netty.http.client;
...
class HttpClientConnect extends HttpClient {
  // Yeah, it implements Predicate.
  static final class HttpClientHandler extends SocketAddress
      implements Predicate<Throwable>, Supplier<SocketAddress> {
    @Override
    public boolean test(Throwable throwable) {
      // When "test" returns true, "retryWhen" will be triggered.
      if (throwable instanceof RedirectClientException) {
        // Oh, this is not our concern.
        RedirectClientException re = (RedirectClientException) throwable;
        redirect(re.location);
        return true;
      }
      if (shouldRetry && AbortedException.isConnectionReset(throwable)) {
        // There it is. What is "shouldRetry" and "AbortedException"?
        shouldRetry = false;
        redirect(toURI.toString());
        return true;
      }
      return false;
    }
    ...
  }
  ...
}
```  

Wow. We found it.  
When the `test` method return `true`, `retryWhen` will be triggered.<sup><a id="ref-1" href="#ref-1">1)</a></sup>  
There is two conditionals, and the latter one is our concern.  
Then, what is `shouldRetry` and `AbortedException`?  
Let's look into `AbortedException` first.  

```java
package reactor.netty.channel;
...
public class AbortedException extends RuntimeException {
  static final String CONNECTION_CLOSED_BEFORE_SEND = "Connection has been closed BEFORE send operation";
  ...
  public static boolean isConnectionReset(Throwable err) {
    return (err instanceof AbortedException && CONNECTION_CLOSED_BEFORE_SEND.equals(err.getMessage())) ||
      (err instanceof IOException && (err.getMessage() == null ||
        err.getMessage()
          .contains("Broken pipe") ||
        err.getMessage()
          .contains("Connection reset by peer"))) ||
      (err instanceof SocketException && err.getMessage() != null &&
        err.getMessage()
          .contains("Connection reset by peer"));
  }
  ...
}
```  

So, you must be familiar with those messages.  
Yes, **it occurs if and only if a connection reset is occurred**.  
It was all about the connection reset issue.  
Then, the next question is, HOW to solve it?  
Let's go through `shouldRetry`.  

```java
package reactor.netty.http.client;
...
class HttpClientConnect extends HttpClient {
  // Yeah, it implements Predicate.
  static final class HttpClientHandler extends SocketAddress
      implements Predicate<Throwable>, Supplier<SocketAddress> {
    ...
    volatile boolean shouldRetry;
    ...

    HttpClientHandler(HttpClientConfig configuration) {
      ...
      // There it is.
      this.shouldRetry = !configuration.retryDisabled;
      ...
    }
    ...
  }
}
```

There it is. When `HttpClientHandler` is constructed, the `shouldRetry` field is initialized with the `!configuration.retryDisabled`.<sup><a id="ref-2" href="#ref-2">2)</a></sup>  
We can find where it is created following the code.  

```java
package reactor.netty.http.client;
...
class HttpClientConnect extends HttpClient {
  ...
  static final class MonoHttpConnect extends Mono<Connection> {
    final HttpClientConfig config;

    MonoHttpConnect(HttpClientConfig config) {
      // b. Who gives the "config" value?
      this.config = config;
    }

    @Override
    @SuppressWarnings("deprecation")
    public void subscribe(CoreSubscriber<? super Connection> actual) {
      // a. It is created.
      HttpClientHandler handler = new HttpClientHandler(config);
      ...
    }
```  

Let's keep going.  

```java
package reactor.netty.http.client;
...
class HttpClientConnect extends HttpClient {
  
  final HttpClientConfig config;

  HttpClientConnect(ConnectionProvider provider) {
    // e. It is initialized by the new object.
    this.config = new HttpClientConfig(
      provider,
      Collections.singletonMap(ChannelOption.AUTO_READ, false),
      () -> AddressUtils.createUnresolved(NetUtil.LOCALHOST.getHostAddress(), DEFAULT_PORT));
  }

  HttpClientConnect(HttpClientConfig config) {
    // d. It is intialized the "config" value or...
    this.config = config;
  }

  @Override
  public HttpClientConfig configuration() {
    // c. It returns "config" field value.
    return config;
  }

  ...

  @Override
  protected Mono<? extends Connection> connect() {
    // b. It calls "configuration" method.
    HttpClientConfig config = configuration();

    Mono<? extends Connection> mono;
    if (config.deferredConf != null) {
      return config.deferredConf.apply(Mono.just(config))
         .flatMap(MonoHttpConnect::new);
    }
    else {
      // a. It is created.
      mono = new MonoHttpConnect(config);
    }
  }
  ...

  @Override
  protected HttpClient duplicate() {
    // f. It is used by this method.
    return new HttpClientConnect(new HttpClientConfig(config));
  }
  ...
}
```  

Then, who uses `duplicate` method?  

```java
package reactor.netty.http.client;
...
public abstract class HttpClient extends ClientTransport<HttpClient, HttpClientConfig> {
  ...
  public final HttpClient disableRetry(boolean disableRetry) {
    if (disableRetry == configuration().retryDisabled) {
      return this;
    }
    // it uses...
    HttpClient dup = duplicate();
    // FOUND IT!
    dup.configuration().retryDisabled = disableRetry;
    return dup;
  }
  ...
}
```

OK, we found it.  
There is the place where the `retryDisabled` value can be manipulated.  
When we set `retryDisabled` to be `true`, `shouldRetry` will be set to be `false`.<sup><a href="#ref-2">2)</a></sup>  
When `shouldRetry` is set to be `false`, `retryWhen` will not be triggered.<sup><a href="#ref-1">1)</a></sup>  
Wow, how simple!  

# Solution  
```kotlin
@Configuration
class WebClientConfig(
  private val reactorResourceFactory: ReactorResourceFactory,
  private val webClientBuilder: WebClient.Builder
) {
  fun getReactorResourceFactory() = reactorResourceFactory.apply {
    this.connectionProvider = ConnectionProvider.builder("webflux")
      ...
      .build()
  }

  fun getReactorClientHttpConnector() = ReactorClientHttpConnector(
      getReactorResourceFactory()
    ) { httpClient: HttpClient ->
      // This is the FIX.
      httpClient.disableRetry(true)
        ...
    }

  @Bean
  fun webClient() = webClientBuilder
    .clientConnector(getReactorClientHttpConnector())
    .build()
}
```

How to solve this problem is very simple.  
We just have to add a single line of code like the above.  
When we initialize the `ReactorClientHttpConnector` we should manipulate the `httpClient` object by calling the `disableRetry(true)` method.  
That's it.  

# Conclusion  

`Exception:java.lang.IllegalStateException: Only one connection receive subscriber allowed.`  
The above exception is thrown if and only if a connection reset is occurred and the first try of the chain is failed.  
We can fix the problem by using `HttpClient::retryDisabled` method.  
  
I suggested to fix this issue on [reactor/reactor-netty](https://github.com/reactor/reactor-netty/issues/2559).  
  
Thank you for reading this article.  
Happy hacking!  