package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoRepository;
import com.antmendoza.temporal.domain.UpdateTodoRequest;
import io.temporal.workflow.*;
import java.util.List;

@WorkflowInterface
public interface WorkflowTodoList {

  @WorkflowMethod
  void run(TodoRepository todoRepository);

  @UpdateMethod
  void addTodo(Todo todo);

  @QueryMethod
  List<Todo> getTodos();

  @UpdateMethod
  void updateTodo(UpdateTodoRequest updateTodoRequest);
}
