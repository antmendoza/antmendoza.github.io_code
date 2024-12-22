package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.*;
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

  private final List<Todo> unprocessedTodos = new ArrayList<>();
  private final TodoService todoService;

  @WorkflowInit
  public WorkflowTodoListImpl(TodoRepository todoRepository) {
    this.todoService = new TodoService(todoRepository);
  }

  @Override
  public void run(TodoRepository todoRepository) {

    while (true) {
      Workflow.await(() -> !unprocessedTodos.isEmpty());

      final Todo todo = unprocessedTodos.remove(0);

      updateOrCreateTimer(todo);
    }
  }

  @Override
  public void addTodo(final Todo todo) {
    Todo savedTodo = this.todoService.save(todo);
    unprocessedTodos.add(savedTodo);
  }

  @Override
  public List<Todo> getTodos() {
    return this.todoService.getAll();
  }

  @Override
  public void updateTodo(final TodoRequest todoRequest) {

    final Optional<Todo> todo =
        this.todoService.updateTodo(
            todoRequest.getId(), todoRequest.getDescription(), todoRequest.getDueDate());

    unprocessedTodos.add(todo.get());
  }

  private void updateOrCreateTimer(final Todo todo) {

    CancellationScope currentTimerScope = timers.get(todo.getId());

    if (currentTimerScope != null) {
      currentTimerScope.cancel();
    }

    if (todo.getDueDate() != null) {

      CancellationScope cancelableScope =
          Workflow.newCancellationScope(
              () -> {
                Workflow.newTimer(calculateDeadline(todo))
                    .thenApply(
                        t -> {

                          // TODO
                          //
                          // this.todoService.updateTodo(todo.getId(), null, null, )
                          todo.setStatus(TodoStatus.EXPIRED);
                          timers.remove(todo.getId());
                          return null;
                        });
              });

      cancelableScope.run();

      timers.put(todo.getId(), cancelableScope);
    }
  }

  private Duration calculateDeadline(final Todo todo) {

    long duration = Instant.parse(todo.getDueDate()).toEpochMilli() - Instant.now().toEpochMilli();

    return Duration.ofMillis(duration);
  }
}
