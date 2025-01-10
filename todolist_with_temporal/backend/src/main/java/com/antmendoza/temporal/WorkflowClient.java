package com.antmendoza.temporal;

import com.antmendoza.temporal.workflow.WorkflowTodoList;
import com.antmendoza.temporal.workflow.WorkflowTodoListImpl;
import io.temporal.client.WorkflowOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.worker.WorkerFactory;
import io.temporal.worker.WorkerFactoryOptions;

public class WorkflowClient {

  public static final String TASK_QUEUE = "TaskInteractionQueue";

  public static void main(String[] args) {

    final WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
    final io.temporal.client.WorkflowClient client = io.temporal.client.WorkflowClient.newInstance(service);

    client.newWorkflowStub(WorkflowTodoList.class, WorkflowOptions.newBuilder()
            .setWorkflowId("")
            .build());

    final WorkerFactoryOptions factoryOptions =
        WorkerFactoryOptions.newBuilder().validateAndBuildWithDefaults();

    final WorkerFactory factory = WorkerFactory.newInstance(client, factoryOptions);

    io.temporal.worker.Worker worker = factory.newWorker(TASK_QUEUE);
    worker.registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);
//    worker.registerActivitiesImplementations(new ActivityTaskImpl(client));

    factory.start();
  }
}
