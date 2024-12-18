package com.antmendoza.temporal;

import io.temporal.workflow.*;
import java.util.List;

@WorkflowInterface
public interface WorkflowTodoList {

  @WorkflowMethod
  void run(TodoList todoList);

  @SignalMethod
  void addTask(Task task);

  @QueryMethod
  List<Task> getTasks();

  @UpdateMethod
  void updateTask(Task task);
}
