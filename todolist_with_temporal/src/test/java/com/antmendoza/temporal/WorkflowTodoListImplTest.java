package com.antmendoza.temporal;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.testing.TestWorkflowRule;
import java.util.UUID;
import org.junit.After;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;

public class WorkflowTodoListImplTest {

  @Rule
  public TestWorkflowRule testWorkflowRule =
      TestWorkflowRule.newBuilder()
          .setDoNotStart(true)
          // .setUseExternalService(true)
          // .setNamespace("default")
          // .setTarget("127.0.0.1:7233")
          .build();

  @After
  public void tearDown() {
    testWorkflowRule.getTestEnvironment().shutdown();
  }

  @Test
  public void testAddTask() throws InterruptedException {
    final String WORKFLOW_ID = "WORKFLOW_ID";

    testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

    testWorkflowRule.getTestEnvironment().start();

    final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
    WorkflowTodoList workflow =
        workflowClient.newWorkflowStub(
            WorkflowTodoList.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(testWorkflowRule.getTaskQueue())
                .setWorkflowId(WORKFLOW_ID)
                .build());

    WorkflowClient.execute(workflow::run, new TodoList());

    workflow.addTask(new Task(UUID.randomUUID().toString(), "todo_1"));

    Assert.assertEquals(1, workflow.getTasks().size());

    workflow.addTask(new Task(UUID.randomUUID().toString(), "todo_2"));

    Assert.assertEquals(2, workflow.getTasks().size());
  }

  @Test
  public void testUpdateTask() throws InterruptedException {
    final String WORKFLOW_ID = "WORKFLOW_ID";

    testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

    testWorkflowRule.getTestEnvironment().start();

    final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
    WorkflowTodoList workflow =
        workflowClient.newWorkflowStub(
            WorkflowTodoList.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(testWorkflowRule.getTaskQueue())
                .setWorkflowId(WORKFLOW_ID)
                .build());

    WorkflowClient.execute(workflow::run, new TodoList());

    final String taskId = UUID.randomUUID().toString();
    workflow.addTask(new Task(taskId, "todo_1"));

    workflow.updateTask(new Task(taskId, "todo_2"));

    Assert.assertEquals(1, workflow.getTasks().size());

    Assert.assertEquals("todo_2", workflow.getTasks().get(0).getTitle());
  }
}
