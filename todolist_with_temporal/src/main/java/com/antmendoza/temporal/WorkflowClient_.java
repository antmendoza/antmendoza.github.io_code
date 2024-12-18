package com.antmendoza.temporal;

import io.temporal.client.WorkflowOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;

public class WorkflowClient_ {

  public static final String TASK_QUEUE = "TaskInteractionQueue";

  public static void main(String[] args) {

    final WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
    final io.temporal.client.WorkflowClient client = io.temporal.client.WorkflowClient.newInstance(service);

    WorkflowTodoList workflow =  client.newWorkflowStub(WorkflowTodoList.class, WorkflowOptions.newBuilder()
            .setWorkflowId("")
            .build());


    io.temporal.client.WorkflowClient.start(workflow::run, new TodoList());


  }
}
