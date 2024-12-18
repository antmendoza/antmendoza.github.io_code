package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoList;
import io.temporal.workflow.Workflow;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;

public class WorkflowTodoListImpl implements WorkflowTodoList {

  private final Logger logger = Workflow.getLogger(WorkflowTodoListImpl.class.getName());

  private TemporalTodo todoList = new TemporalTodo();
  private List<Todo> unprocessedTasks = new ArrayList<>();

  @Override
  public void run(TodoList todoList) {

    while (true) {
      Workflow.await(() -> !unprocessedTasks.isEmpty());

      final Todo task = unprocessedTasks.remove(0);

      this.todoList.addTask(task);
    }
  }

  @Override
  public void addTodo(final Todo todo) {
    unprocessedTasks.add(todo);
  }

  @Override
  public List<Todo> getTodos() {
    return this.todoList.getTasks();
  }

  @Override
  public void updateTodo(final Todo todo) {
    unprocessedTasks.add(todo);
  }
}
