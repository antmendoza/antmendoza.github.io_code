package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoList;
import io.temporal.workflow.*;
import java.util.List;

@WorkflowInterface
public interface WorkflowTodoList {

  @WorkflowMethod
  void run(TodoList todoList);

  @UpdateMethod
  void addTodo(Todo todo);

  @QueryMethod
  List<Todo> getTodos();

  @UpdateMethod
  void updateTodo(Todo todo);
}
