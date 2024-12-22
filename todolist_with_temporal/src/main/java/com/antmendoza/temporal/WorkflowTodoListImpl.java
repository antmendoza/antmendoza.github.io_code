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

      final Todo task = unprocessedTodos.remove(0);

      updateOrCreateTimerTask(task);
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

  private void updateOrCreateTimerTask(final Todo task) {

    CancellationScope currentTimerScope = timers.get(task.getId());

    if (currentTimerScope != null) {
      currentTimerScope.cancel();
    }

    if (task.getDueDate() != null) {

      CancellationScope cancelableScope =
          Workflow.newCancellationScope(
              () -> {
                Workflow.newTimer(calculateDeadline(task))
                    .thenApply(
                        t -> {

                          // TODO
                          //
                          // this.todoService.updateTodo(task.getId(), null, null, )
                          task.setStatus(TodoStatus.EXPIRED);
                          timers.remove(task.getId());
                          return null;
                        });
              });

      cancelableScope.run();

      timers.put(task.getId(), cancelableScope);
    }
  }

  private Duration calculateDeadline(final Todo task) {

    long duration = Instant.parse(task.getDueDate()).toEpochMilli() - Instant.now().toEpochMilli();

    return Duration.ofMillis(duration);
  }
}
