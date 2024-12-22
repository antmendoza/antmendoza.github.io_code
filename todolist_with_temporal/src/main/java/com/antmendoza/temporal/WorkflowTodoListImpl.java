package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.*;
import io.temporal.failure.CanceledFailure;
import io.temporal.workflow.CancellationScope;
import io.temporal.workflow.Workflow;
import io.temporal.workflow.WorkflowInit;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.slf4j.Logger;

public class WorkflowTodoListImpl implements WorkflowTodoList {

  private final Logger logger = Workflow.getLogger(WorkflowTodoListImpl.class.getName());

  private final Map<String, CancellationScope> timers = new HashMap<>();

  private final List<Todo> unprocessedRequests = new ArrayList<>();
  private final TodoService todoService;

  @WorkflowInit
  public WorkflowTodoListImpl(TodoRepository todoRepository) {
    this.todoService =
        new TodoService(
            todoRepository,
            new DateProvider() {
              @Override
              public long getCurrentMs() {
                return Workflow.currentTimeMillis();
              }
            });
  }

  @Override
  public void run(TodoRepository todoRepository) {

    while (true) {
      Workflow.await(() -> !unprocessedRequests.isEmpty());

      final Todo todo = unprocessedRequests.remove(0);

      updateOrCreateTimer(todo);
    }
  }

  @Override
  public void addTodo(final Todo todo) {
    final Todo savedTodo = this.todoService.save(todo);
    unprocessedRequests.add(savedTodo);
  }

  @Override
  public List<Todo> getTodos() {
    return this.todoService.getAll();
  }

  @Override
  public void updateTodo(final UpdateTodoRequest updateTodoRequest) {

    final Optional<Todo> todo =
        this.todoService.updateTodo(
            updateTodoRequest.getId(),
            updateTodoRequest.getDescription(),
            updateTodoRequest.getDueDate());

    unprocessedRequests.add(todo.get());
  }

  private void updateOrCreateTimer(final Todo todo) {

    logger.info("updateOrCreateTimer {} ", todo);
    CancellationScope currentTimerScope = timers.get(todo.getId());

    if (currentTimerScope != null) {
      currentTimerScope.cancel();
      timers.remove(todo.getId());
    }

    if (todo.getDueDate() != null) {

      CancellationScope cancelableScope =
          Workflow.newCancellationScope(
              () -> {
                Workflow.newTimer(calculateDeadline(todo))
                    .handle(
                        (value, exception) -> {
                          logger.info("Handle cancellation scope {}", todo);

                          if (exception == null) {
                            logger.info("Timer fired");

                            this.todoService.updateTodo(todo.getId(), null, todo.getDueDate());
                            // todo.setStatus(TodoStatus.EXPIRED);
                            timers.remove(todo.getId());

                          } else if (exception instanceof CanceledFailure) {
                            logger.info("Timer cancelled");
                          }

                          return value;
                        });
              });

      cancelableScope.run();

      timers.put(todo.getId(), cancelableScope);
    }
  }

  private Duration calculateDeadline(final Todo todo) {

    long duration =
        Instant.parse(todo.getDueDate()).toEpochMilli()
            - Instant.ofEpochMilli(Workflow.currentTimeMillis()).toEpochMilli();

    return Duration.ofMillis(duration);
  }
}
