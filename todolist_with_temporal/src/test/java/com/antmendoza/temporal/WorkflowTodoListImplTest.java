package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoRepository;
import com.antmendoza.temporal.domain.TodoRequest;
import com.antmendoza.temporal.domain.TodoStatus;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.testing.TestWorkflowRule;
import java.time.Duration;
import java.time.Instant;
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
          //  .setUseExternalService(true)
          //  .setNamespace("default")
          //  .setTarget("127.0.0.1:7233")
          .build();

  @After
  public void tearDown() {

    // testWorkflowRule.getTestEnvironment().shutdown();
  }

  @Test
  public void testAddTodo() {
    final String WORKFLOW_ID = "MY_WORKFLOW_ID";

    testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

    testWorkflowRule.getTestEnvironment().start();

    final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
    final WorkflowTodoList workflow =
        workflowClient.newWorkflowStub(
            WorkflowTodoList.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(testWorkflowRule.getTaskQueue())
                .setWorkflowId(WORKFLOW_ID)
                .build());

    WorkflowClient.execute(workflow::run, new TodoRepository());

    workflow.addTodo(new Todo(UUID.randomUUID().toString(), "todo_1"));

    Assert.assertEquals(1, workflow.getTodos().size());

    workflow.addTodo(new Todo(UUID.randomUUID().toString(), "todo_2"));

    Assert.assertEquals(2, workflow.getTodos().size());
  }

  @Test
  public void testUpdateTodo() {
    final String WORKFLOW_ID = "MY_WORKFLOW_ID";

    testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

    testWorkflowRule.getTestEnvironment().start();

    final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
    final WorkflowTodoList workflow =
        workflowClient.newWorkflowStub(
            WorkflowTodoList.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(testWorkflowRule.getTaskQueue())
                .setWorkflowId(WORKFLOW_ID)
                .build());

    WorkflowClient.execute(workflow::run, new TodoRepository());

    final String todoId = UUID.randomUUID().toString();
    workflow.addTodo(new Todo(todoId, "todo_1"));

    workflow.updateTodo(new TodoRequest(todoId, "todo_2", null));

    Assert.assertEquals(1, workflow.getTodos().size());

    Assert.assertEquals("todo_2", workflow.getTodos().get(0).getTitle());
  }

  @Test
  public void testWithDueDate() {
    final String WORKFLOW_ID = "MY_WORKFLOW_ID";

    testWorkflowRule.getWorker().registerWorkflowImplementationTypes(WorkflowTodoListImpl.class);

    testWorkflowRule.getTestEnvironment().start();

    final WorkflowClient workflowClient = testWorkflowRule.getWorkflowClient();
    final WorkflowTodoList workflow =
        workflowClient.newWorkflowStub(
            WorkflowTodoList.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(testWorkflowRule.getTaskQueue())
                .setWorkflowId(WORKFLOW_ID)
                .build());

    WorkflowClient.execute(workflow::run, new TodoRepository());

    final String todoId = UUID.randomUUID().toString();
    workflow.addTodo(new Todo(todoId, "todo_1", Instant.now().plusSeconds(20).toString()));

    Assert.assertEquals(1, workflow.getTodos().size());

    Assert.assertEquals("todo_1", workflow.getTodos().get(0).getTitle());
    Assert.assertEquals(TodoStatus.ACTIVE, workflow.getTodos().get(0).getStatus());

    testWorkflowRule.getTestEnvironment().sleep(Duration.ofSeconds(20));

    Assert.assertEquals(TodoStatus.EXPIRED, workflow.getTodos().get(0).getStatus());

    workflow.updateTodo(new TodoRequest(todoId, "todo_1", Instant.now().plusSeconds(5).toString()));

    Assert.assertEquals(TodoStatus.ACTIVE, workflow.getTodos().get(0).getStatus());
    testWorkflowRule.getTestEnvironment().sleep(Duration.ofSeconds(5));

    Assert.assertEquals(TodoStatus.EXPIRED, workflow.getTodos().get(0).getStatus());
  }
}
