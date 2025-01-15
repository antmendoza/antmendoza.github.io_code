package com.antmendoza.temporal.workflow;

import com.antmendoza.temporal.domain.model.Todo;
import com.antmendoza.temporal.domain.TodoList;
import com.antmendoza.temporal.presentation.dto.TodoRequest;
import io.temporal.workflow.*;
import java.util.List;

@WorkflowInterface
public interface WorkflowTodoList {

  @WorkflowMethod
  void run(TodoList todoList);

  @UpdateMethod
  void addTodo(final TodoRequest todoRequest);

  @QueryMethod
  List<Todo> getTodos();

  @UpdateMethod
  void updateTodo(TodoRequest todoRequest);


  @UpdateMethod
  void completeTodo(String id);

  @UpdateMethod
  void deleteTodo(String id);
}
