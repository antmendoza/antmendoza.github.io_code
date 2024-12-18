package com.antmendoza.temporal;

import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.worker.WorkerFactory;
import io.temporal.worker.WorkerFactoryOptions;

public class WorkflowWorker_ {

  public static final String TASK_QUEUE = "TaskInteractionQueue";

  public static void main(String[] args) {

    final WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
    final WorkflowClient client = WorkflowClient.newInstance(service);

    final WorkerFactoryOptions factoryOptions =
        WorkerFactoryOptions.newBuilder().validateAndBuildWithDefaults();

    final WorkerFactory factory = WorkerFactory.newInstance(client, factoryOptions);

    io.temporal.worker.Worker worker = factory.newWorker(TASK_QUEUE);
    worker.registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);
    //    worker.registerActivitiesImplementations(new ActivityTaskImpl(client));

    factory.start();
  }
}
