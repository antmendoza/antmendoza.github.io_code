

## Using service name to connect to temporal server


```
frontend_app-1  |   ➜  Local:   http://localhost:4200/
frontend_app-1  |   ➜  Network: http://172.28.0.4:4200/
backend_app-1   | io.grpc.StatusRuntimeException: UNAVAILABLE: io exception
backend_app-1   |       at io.grpc.stub.ClientCalls.toStatusRuntimeException(ClientCalls.java:271)
backend_app-1   |       at io.grpc.stub.ClientCalls.getUnchecked(ClientCalls.java:252)
backend_app-1   |       at io.grpc.stub.ClientCalls.blockingUnaryCall(ClientCalls.java:165)
backend_app-1   |       at io.temporal.api.workflowservice.v1.WorkflowServiceGrpc$WorkflowServiceBlockingStub.getSystemInfo(WorkflowServiceGrpc.java:4864)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.getServerCapabilitiesOrThrow(SystemInfoInterceptor.java:132)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.lambda$getServerCapabilitiesWithRetryOrThrow$0(SystemInfoInterceptor.java:118)
backend_app-1   |       at io.temporal.internal.retryer.GrpcSyncRetryer.retry(GrpcSyncRetryer.java:69)
backend_app-1   |       at io.temporal.internal.retryer.GrpcRetryer.retryWithResult(GrpcRetryer.java:60)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.getServerCapabilitiesWithRetryOrThrow(SystemInfoInterceptor.java:117)
backend_app-1   |       at io.temporal.serviceclient.ChannelManager.lambda$getServerCapabilities$3(ChannelManager.java:346)
backend_app-1   |       at io.temporal.internal.retryer.GrpcRetryer.retryWithResult(GrpcRetryer.java:60)
backend_app-1   |       at io.temporal.serviceclient.ChannelManager.connect(ChannelManager.java:320)
backend_app-1   |       at io.temporal.serviceclient.WorkflowServiceStubsImpl.connect(WorkflowServiceStubsImpl.java:161)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
backend_app-1   |       at java.base/java.lang.reflect.Method.invoke(Method.java:568)
backend_app-1   |       at io.temporal.internal.WorkflowThreadMarker.lambda$protectFromWorkflowThread$1(WorkflowThreadMarker.java:83)
backend_app-1   |       at jdk.proxy2/jdk.proxy2.$Proxy60.connect(Unknown Source)
backend_app-1   |       at io.temporal.worker.WorkerFactory.start(WorkerFactory.java:219)
backend_app-1   |       at com.antmendoza.temporal.WorkflowWorker.<init>(WorkflowWorker.java:32)
backend_app-1   |       at com.antmendoza.temporal.WorkflowWorker$$SpringCGLIB$$0.<init>(<generated>)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
backend_app-1   |       at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:499)
backend_app-1   |       at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:480)
backend_app-1   |       at org.springframework.beans.BeanUtils.instantiateClass(BeanUtils.java:197)
backend_app-1   |       at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:88)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateBean(AbstractAutowireCapableBeanFactory.java:1312)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1203)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:563)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
backend_app-1   |       at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
backend_app-1   |       at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:973)
backend_app-1   |       at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:946)
backend_app-1   |       at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:616)
backend_app-1   |       at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146)
backend_app-1   |       at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:753)
backend_app-1   |       at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:455)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:323)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:1342)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:1331)
backend_app-1   |       at com.antmendoza.temporal.TemporalSpringbootDemoApplication.main(TemporalSpringbootDemoApplication.java:13)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
backend_app-1   |       at java.base/java.lang.reflect.Method.invoke(Method.java:568)
backend_app-1   |       at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:91)
backend_app-1   |       at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:53)
backend_app-1   |       at org.springframework.boot.loader.launch.JarLauncher.main(JarLauncher.java:58)
backend_app-1   | Caused by: io.grpc.netty.shaded.io.netty.channel.AbstractChannel$AnnotatedConnectException: finishConnect(..) failed: Connection refused: temporal/172.28.0.2:7233
backend_app-1   | Caused by: java.net.ConnectException: finishConnect(..) failed: Connection refused
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Errors.newConnectException0(Errors.java:155)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Errors.handleConnectErrno(Errors.java:128)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Socket.finishConnect(Socket.java:359)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.doFinishConnect(AbstractEpollChannel.java:710)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.finishConnect(AbstractEpollChannel.java:687)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.epollOutReady(AbstractEpollChannel.java:567)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.EpollEventLoop.processReady(EpollEventLoop.java:489)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:397)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:997)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
backend_app-1   |       at java.base/java.lang.Thread.run(Thread.java:833)
backend_app-1   | 17:32:17.084 { } [main] INFO  o.a.coyote.http11.Http11NioProtocol - Starting ProtocolHandler ["http-nio-3030"] 
backend_app-1   | 17:32:17.099 { } [main] INFO  o.s.b.w.e.tomcat.TomcatWebServer - Tomcat started on port 3030 (http) with context path '' 
backend_app-1   | 17:32:17.106 { } [main] INFO  c.a.t.TemporalSpringbootDemoApplication - Started TemporalSpringbootDemoApplication in 7.389 seconds (process running for 7.687) 
backend_app-1   | 17:32:54.290 { } [http-nio-3030-exec-1] INFO  o.a.c.c.C.[Tomcat].[localhost].[/] - Initializing Spring DispatcherServlet 'dispatcherServlet' 
backend_app-1   | 17:32:54.290 { } [http-nio-3030-exec-1] INFO  o.s.web.servlet.DispatcherServlet - Initializing Servlet 'dispatcherServlet' 
backend_app-1   | 17:32:54.290 { } [http-nio-3030-exec-1] INFO  o.s.web.servlet.DispatcherServlet - Completed initialization in 0 ms 



```


## Localhost

```

frontend_app-1  | Watch mode enabled. Watching for file changes...
frontend_app-1  | NOTE: Raw file sizes do not reflect development server per-request transformations.
frontend_app-1  |   ➜  Local:   http://localhost:4200/
frontend_app-1  |   ➜  Network: http://172.28.0.4:4200/
backend_app-1   | io.grpc.StatusRuntimeException: UNAVAILABLE: io exception
backend_app-1   |       at io.grpc.stub.ClientCalls.toStatusRuntimeException(ClientCalls.java:271)
backend_app-1   |       at io.grpc.stub.ClientCalls.getUnchecked(ClientCalls.java:252)
backend_app-1   |       at io.grpc.stub.ClientCalls.blockingUnaryCall(ClientCalls.java:165)
backend_app-1   |       at io.temporal.api.workflowservice.v1.WorkflowServiceGrpc$WorkflowServiceBlockingStub.getSystemInfo(WorkflowServiceGrpc.java:4864)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.getServerCapabilitiesOrThrow(SystemInfoInterceptor.java:132)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.lambda$getServerCapabilitiesWithRetryOrThrow$0(SystemInfoInterceptor.java:118)
backend_app-1   |       at io.temporal.internal.retryer.GrpcSyncRetryer.retry(GrpcSyncRetryer.java:69)
backend_app-1   |       at io.temporal.internal.retryer.GrpcRetryer.retryWithResult(GrpcRetryer.java:60)
backend_app-1   |       at io.temporal.serviceclient.SystemInfoInterceptor.getServerCapabilitiesWithRetryOrThrow(SystemInfoInterceptor.java:117)
backend_app-1   |       at io.temporal.serviceclient.ChannelManager.lambda$getServerCapabilities$3(ChannelManager.java:346)
backend_app-1   |       at io.temporal.internal.retryer.GrpcRetryer.retryWithResult(GrpcRetryer.java:60)
backend_app-1   |       at io.temporal.serviceclient.ChannelManager.connect(ChannelManager.java:320)
backend_app-1   |       at io.temporal.serviceclient.WorkflowServiceStubsImpl.connect(WorkflowServiceStubsImpl.java:161)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
backend_app-1   |       at java.base/java.lang.reflect.Method.invoke(Method.java:568)
backend_app-1   |       at io.temporal.internal.WorkflowThreadMarker.lambda$protectFromWorkflowThread$1(WorkflowThreadMarker.java:83)
backend_app-1   |       at jdk.proxy2/jdk.proxy2.$Proxy60.connect(Unknown Source)
backend_app-1   |       at io.temporal.worker.WorkerFactory.start(WorkerFactory.java:219)
backend_app-1   |       at com.antmendoza.temporal.WorkflowWorker.<init>(WorkflowWorker.java:32)
backend_app-1   |       at com.antmendoza.temporal.WorkflowWorker$$SpringCGLIB$$0.<init>(<generated>)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
backend_app-1   |       at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:499)
backend_app-1   |       at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:480)
backend_app-1   |       at org.springframework.beans.BeanUtils.instantiateClass(BeanUtils.java:197)
backend_app-1   |       at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:88)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateBean(AbstractAutowireCapableBeanFactory.java:1312)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1203)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:563)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
backend_app-1   |       at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
backend_app-1   |       at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
backend_app-1   |       at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:973)
backend_app-1   |       at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:946)
backend_app-1   |       at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:616)
backend_app-1   |       at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146)
backend_app-1   |       at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:753)
backend_app-1   |       at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:455)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:323)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:1342)
backend_app-1   |       at org.springframework.boot.SpringApplication.run(SpringApplication.java:1331)
backend_app-1   |       at com.antmendoza.temporal.TemporalSpringbootDemoApplication.main(TemporalSpringbootDemoApplication.java:13)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
backend_app-1   |       at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
backend_app-1   |       at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
backend_app-1   |       at java.base/java.lang.reflect.Method.invoke(Method.java:568)
backend_app-1   |       at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:91)
backend_app-1   |       at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:53)
backend_app-1   |       at org.springframework.boot.loader.launch.JarLauncher.main(JarLauncher.java:58)
backend_app-1   | Caused by: io.grpc.netty.shaded.io.netty.channel.AbstractChannel$AnnotatedConnectException: finishConnect(..) failed: Connection refused: localhost/[0:0:0:0:0:0:0:1]:7233
backend_app-1   | Caused by: java.net.ConnectException: finishConnect(..) failed: Connection refused
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Errors.newConnectException0(Errors.java:155)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Errors.handleConnectErrno(Errors.java:128)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.unix.Socket.finishConnect(Socket.java:359)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.doFinishConnect(AbstractEpollChannel.java:710)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.finishConnect(AbstractEpollChannel.java:687)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.AbstractEpollChannel$AbstractEpollUnsafe.epollOutReady(AbstractEpollChannel.java:567)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.EpollEventLoop.processReady(EpollEventLoop.java:489)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:397)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:997)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
backend_app-1   |       at io.grpc.netty.shaded.io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
backend_app-1   |       at java.base/java.lang.Thread.run(Thread.java:833)
backend_app-1   | 17:46:58.406 { } [main] INFO  o.a.coyote.http11.Http11NioProtocol - Starting ProtocolHandler ["http-nio-3030"] 
backend_app-1   | 17:46:58.418 { } [main] INFO  o.s.b.w.e.tomcat.TomcatWebServer - Tomcat started on port 3030 (http) with context path '' 
backend_app-1   | 17:46:58.426 { } [main] INFO  c.a.t.TemporalSpringbootDemoApplication - Started TemporalSpringbootDemoApplication in 7.65 seconds (process running for 7.945) 


```


## Trying to access the temporal server from the backend docker image

```
docker exec -it 2520da73f617  bash
bash-4.4# curl -sSL "https://github.com/fullstorydev/grpcurl/releases/download/v1.8.7/grpcurl_1.8.7_linux_x86_64.tar.gz" | tar -xz -C /usr/local/bin
bash-4.4# grpcurl  -plaintext localhost:7233 list
Failed to dial target host "localhost:7233": dial tcp [::1]:7233: connect: connection refused
bash-4.4# grpcurl  -plaintext temporal:7233 list
Failed to dial target host "temporal:7233": dial tcp 172.28.0.2:7233: connect: connection refused
bash-4.4# 
```





