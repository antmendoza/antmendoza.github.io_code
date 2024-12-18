package com.antmendoza.temporal;

import io.temporal.workflow.Workflow;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;

public class WorkflowTodoListImpl implements WorkflowTodoList {
  private final Logger logger = Workflow.getLogger(WorkflowTodoListImpl.class.getName());

  private TodoList todoList = new TodoList();
  private List<Task> unprocessedTasks = new ArrayList<>();

  @Override
  public void run(TodoList todoList) {

    while (true) {
      Workflow.await(() -> !unprocessedTasks.isEmpty());

      final Task task = unprocessedTasks.remove(0);

      this.todoList.addTask(task);
    }
  }

  @Override
  public void addTask(final Task task) {
    unprocessedTasks.add(task);
  }

  @Override
  public List<Task> getTasks() {
    return this.todoList.getTasks();
  }

  @Override
  public void updateTask(final Task task) {
    unprocessedTasks.add(task);
  }
}
