package com.antmendoza.temporal.infrastructure.workflow;

import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.worker.WorkerFactory;
import io.temporal.worker.WorkerFactoryOptions;
import org.springframework.context.annotation.Configuration;


@Configuration
public class WorkflowWorker {

    public static final String TASK_QUEUE = "todo-list-tq";
    private static WorkflowClient client;

    public WorkflowWorker() {


        final WorkflowClient client = getWorkflowClient();

        final WorkerFactoryOptions factoryOptions =
                WorkerFactoryOptions.newBuilder().validateAndBuildWithDefaults();

        final WorkerFactory factory = WorkerFactory.newInstance(client, factoryOptions);

        io.temporal.worker.Worker worker = factory.newWorker(TASK_QUEUE);
        worker.registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

        factory.start();
    }

    public static WorkflowClient getWorkflowClient() {


        final WorkflowClient client = getClient();
        return client;
    }

    private static WorkflowClient getClient() {

        if (WorkflowWorker.client == null) {

            String temporalHost = "localhost:7233";
            final String envTemporalHost = System.getenv("TEMPORAL_ADDRESS");
            final Boolean useTemporalAddress = Boolean.parseBoolean(System.getenv("USE_TEMPORAL_ADDRESS"));

            if (envTemporalHost != null && useTemporalAddress) {
                temporalHost = envTemporalHost;
            }


            final WorkflowServiceStubs service =
                    WorkflowServiceStubs.newServiceStubs
                            (WorkflowServiceStubsOptions.newBuilder()
                                    .setTarget(temporalHost)
                                    .build());

            final WorkflowClient client = WorkflowClient.newInstance(service);
            WorkflowWorker.client = client;

        }
        return WorkflowWorker.client;
    }
}
